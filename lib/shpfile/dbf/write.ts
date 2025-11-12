import { dbf_type_length, js_type_to_dbf_type, DbfField, TDbfType } from "./utils";
import iconv from 'iconv-lite';

type TRecords = Array<GeoJSON.GeoJsonProperties> | Array<GeoJSON.Feature>;

export function writeDbf(options: {
    data: TRecords | GeoJSON.FeatureCollection,
    encoding?: string
}) {
    const encoding = options.encoding ?? "utf-8";
    const records = options.data instanceof Array ? options.data : options.data.features;
    const fields = inferDbfFields(records);

    const headerLength = 32 + fields.length * 32 + 1;
    const recordLength = fields.reduce((acc, field) => acc + field.length, 1) * records.length; // 1 byte for deleted flag

    const now = new Date();
    const view = new DataView(new ArrayBuffer(headerLength + recordLength));

    view.setUint8(0, 0x03);
    view.setUint8(1, now.getFullYear() - 1900);
    view.setUint8(2, now.getMonth() + 1);
    view.setUint8(3, now.getDate());
    view.setUint32(4, records.length, true);
    view.setUint16(8, headerLength, true);

    // 终止符
    view.setInt8(headerLength - 1, 0x0D);

    // 字段描述块
    fields.forEach((field, index) => {
        // 字段名
        fillStrToView(view, 32 + index * 32, field.name, encoding, 10);

        // 字段类型
        view.setUint8(32 + index * 32 + 11, field.type.charCodeAt(0));

        // 字段长度
        view.setUint8(32 + index * 32 + 16, field.length);

        // 浮点数精度
        if (field.type === "N" || field.type === "F") {
            view.setUint8(32 + index * 32 + 17, field.decimals ?? 3);
        }
    });

    let offset = headerLength;

    foreachRecords(records, (record, index) => {
        // delete flag
        view.setUint8(offset, 0x20);
        offset += 1;

        fields.forEach(field => {
            let val = record![field.name]
            if (val === null || val === undefined) val = "";

            switch (field.type) {
                case "L":
                    view.setUint8(offset, val ? 84 : 70);
                    break;
                case "D":
                    if (val instanceof Date) {
                        const yms = val.toLocaleDateString().split("/");
                        val = `${yms[0]}${yms[1].padStart(2, '0')}${yms[2].padStart(2, '0')}`;
                    }
                    fillStrToView(view, offset, val, encoding, field.length, "left");
                    break;
                case "N":
                    fillStrToView(view, offset, val.toString(), encoding, field.length, "left");
                    break;
                case "C":
                    const valType = typeof val;
                    let valStr = "";
                    if(valType === "string") valStr = val;
                    else if(valType === "number" || valType === "boolean" || valType === 'bigint') valStr = val.toString();
                    else if(valType === "object"){
                        if(val instanceof Date) valStr = val.toLocaleString();
                        else valStr = JSON.stringify(val);
                    }else {
                        valStr = valType;
                    }
                    fillStrToView(view, offset, valStr, encoding, field.length, "right");
                    break;
                default:
                    throw new Error(`Unsupported field type: ${field.type}`);
            }

            offset += field.length;
        });
    });

    // EOF flag
    view.setUint8(offset, 0x1A);
    return view;
}

function inferDbfFields(records: TRecords): Array<DbfField> {
    // 获取尽可能多的数据类型
    const field_map = new Map<string, Set<TDbfType | undefined>>();
    foreachRecords(records, (record) => {
        for (const key in record) {
            const value = record[key];
            const type = typeof value;

            if (type === "function" || type === 'symbol') continue;

            const dbfType = value instanceof Date ? 'D' : js_type_to_dbf_type[type];

            const set = field_map.get(key);
            if (set) {
                set.add(dbfType);
            } else {
                field_map.set(key, new Set([dbfType]));
            }
        }
    });

    const result = new Array<DbfField>();
    field_map.forEach((v, k) => {
        let type: TDbfType = "C"; // 默认字符串

        // 单一类型
        if (v.size === 1) {
            const vt = v.values().next().value;
            if (vt !== undefined)
                type = vt;
        }

        // 两个类型，有可能是可空类型、混合类型
        else if (v.size === 2) {
            if (v.has(undefined)) {
                v.delete(undefined);
                type = v.values().next().value!;
            }
        }

        result.push({
            name: k,
            type,
            length: dbf_type_length[type],
            decimals: 0
        });
    })

    return result;
}

function foreachRecords(records: TRecords, callback: (record: GeoJSON.GeoJsonProperties, index: number) => void) {
    records.forEach((record, index) => {
        if ((record as any).type === "Feature") {
            record = (record as GeoJSON.Feature).properties;
        }

        callback(record, index);
    });
}

function fillStrToView(view: DataView, offset: number, str: string, encoding: string, maxLength: number, padDirection: "left" | "right" = "right", padChar: string = " ") {
    if (padDirection === "left") str = str.padStart(maxLength, padChar);
    else str = str.padEnd(maxLength, padChar);

    const bytes = iconv.encode(str, encoding);
    for (let i = 0; i < bytes.length && i < maxLength; i++) {
        view.setInt8(offset + i, bytes[i]);
    }
}