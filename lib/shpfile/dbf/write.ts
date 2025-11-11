import { DbfField, TJSType } from "./type";
import { inferDbfFieldLength, inferDbfType, jsDataToDbfStr } from "./utils";
import iconv from 'iconv-lite';

export function writeDbf(options: {
    data: Array<GeoJSON.GeoJsonProperties> | Array<GeoJSON.Feature> | GeoJSON.FeatureCollection,
    encoding?: string
}) {
    const encoding = options.encoding ?? "utf-8";
    const records = options.data instanceof Array ? options.data : options.data.features;

    // 手机字段
    const fieldsMap = new Map<string, Map<DbfField['type'] | "UNDEFINED", { jsType: TJSType, maxStrLength: number }>>();
    records.forEach(item => {
        if ((item as any).type === 'Feature')
            item = (item as GeoJSON.Feature).properties;

        for (const key in item) {
            const value = item[key];
            const valueType = typeof value;

            if (valueType === 'function' || valueType === 'symbol') {
                continue;
            }

            let valueStrLength = 0;
            if (value !== undefined || value !== null) {
                if (valueType === 'object') {
                    valueStrLength = JSON.stringify(value).length;
                } else {
                    valueStrLength = value.toString().length;
                }
            }

            const dbfFieldType = inferDbfType(value);
            let fields = fieldsMap.get(key);
            if (fields === undefined) {
                fields = new Map<DbfField['type'], { jsType: TJSType, maxStrLength: number }>();
                fieldsMap.set(key, fields);
            }

            let def = fields.get(dbfFieldType);
            if (def === undefined) {
                def = {
                    jsType: valueType,
                    maxStrLength: valueStrLength
                }
                fields.set(dbfFieldType, def);
            }
            else {
                def.maxStrLength = Math.max(def.maxStrLength, valueStrLength);
            }
        }
    });

    // 清洗 field define
    const fieldDefs = new Array<{ name: string, type: DbfField['type'], length: number }>();
    for (const [key, fields] of fieldsMap) {
        if (fields.size === 1) {
            const field = fields.entries().next().value!;
            const type = field[0] === 'UNDEFINED' ? 'C' : field[0];
            fieldDefs.push({ name: key, type, length: field[1].maxStrLength });
        }
        else {
            const types = Array.from(fields.keys());

            // 包括空值的字段类型
            if (types.length === 2 && types.includes("UNDEFINED")) {
                const type = types[(types.indexOf("UNDEFINED") + 1) % 2] as DbfField['type'];
                fieldDefs.push({ name: key, type, length: fields.get(type)!.maxStrLength });
            }
            else {
                fieldDefs.push({ name: key, type: "C", length: Array.from(fields.values()).reduce((a, b) => Math.max(a, b.maxStrLength), 0) })
            }
        }
    }

    const headerLength = 32 + fieldDefs.length * 32 + 1;
    const recordLength = fieldDefs.reduce((a, b) => a + inferDbfFieldLength(b.type, b.length, encoding), 0) + 1;

    // 写入头数据
    const dataView = new DataView(new ArrayBuffer(headerLength + recordLength));
    // 版本
    dataView.setUint8(0, 0x03);

    // 日期
    const date = new Date();
    dataView.setUint8(1, date.getFullYear() - 1900);
    dataView.setUint8(2, date.getMonth() + 1);
    dataView.setUint8(3, date.getDate());

    // 记录条数
    dataView.setUint32(4, records.length, true);

    // 头文件长度
    dataView.setUint16(8, headerLength, true);

    // 记录长度
    dataView.setUint16(10, recordLength, true);

    // 保留字段
    for (let i = 0; i < 20; i++) {
        dataView.setUint8(12 + i, 0);
    }

    let offset = 32;

    fieldDefs.forEach((field, i) => {
        const nameBuffer = iconv.encode(field.name, encoding);
        nameBuffer.forEach((b, j) => {
            if (j > 10) return;

            dataView.setUint8(offset + j, b);
        });

        // 补0
        for (let j = nameBuffer.length; j < 11; j++) {
            dataView.setUint8(offset + j, 0x00);
        }

        offset += 11;

        //字段类型
        dataView.setUint8(offset, field.type.charCodeAt(0));
        offset += 1;

        // 第12-15字节：系统保留区，填充0（补充的4字节）
        for (let i = 0; i < 4; i++) {
            dataView.setUint8(offset + i, 0);
        }
        offset += 4; // 补充移动这4字节的偏移量

        // 字段长度
        dataView.setUint8(offset, field.length);
        offset++;

        // 小数位数 TODO: 暂不处理
        dataView.setUint8(offset, 6);
        offset++;

        // 保留字段（填充0）
        for (let i = 0; i < 14; i++) {
            dataView.setUint8(offset + i, 0);
        }
        offset += 14;
    });

    // 截止字段
    dataView.setUint8(32 + fieldDefs.length * 32, 0x0d);

    offset = headerLength;

    records.forEach(record => {
        if ((record as any).type === 'Feature')
            record = (record as GeoJSON.Feature).properties;

        // 删除标记（空格表示未删除）
        dataView.setUint8(offset, 0x20);
        offset += 1;

        fieldDefs.forEach(field => {
            const value = record![field.name];
            const str = jsDataToDbfStr(value, field.type, field.length);
            const strBuffer = iconv.encode(str, encoding);
            strBuffer.forEach((b, i) => {
                dataView.setUint8(offset + i, b);
            });

            offset += field.length;
        });
    });

    dataView.setUint8(offset, 0x1A);

    return dataView.buffer;
}