import { getArrayBufferFromDataView } from "../../utils";
import { DbfField, DbfHeader } from "./type";
import { JSTypeToDbfType, TJSType } from "./utils";

export function readDbf(options: {
    file: {
        buffer: ArrayBuffer;
        byteOffset?: number;
        byteLength?: number;
    },
    encoding?: string;
}) {
    const dataView = new DataView(
        options.file.buffer,
        options.file.byteOffset,
        options.file.byteLength
    );

    const header: DbfHeader = {
        lastUpdated: new Date(dataView.getUint8(1) + 1900, dataView.getUint8(2) - 1, dataView.getUint8(3)), // 注意月份从0开始
        recordCount: dataView.getInt32(4, true),
        headerLength: dataView.getInt16(8, true),
        recordLength: dataView.getInt16(10, true)
    };

    // 计算字段数量
    const fieldCount = (header.headerLength - 33) / 32; // 头长度减去基础头和终止符，除以每个字段描述块的大小
    const fields: DbfField[] = [];
    const textDecoder = new TextDecoder(options.encoding);

    let offset = 32; // 跳过基础头，开始读取字段描述

    for (let i = 0; i < fieldCount; i++) {
        let nameLength = 0;
        for (let j = 0; j < 11; j++) {
            if (dataView.getUint8(offset + j) === 0x00) break;
            nameLength++;
        }

        const name = textDecoder.decode(getArrayBufferFromDataView(dataView, offset, nameLength));
        const type = String.fromCharCode(dataView.getUint8(offset + 11)) as DbfField["type"];
        const length = dataView.getUint8(offset + 16);
        const decimalPlaces = dataView.getUint8(offset + 17);

        fields.push({ name, type, length, decimalPlaces });
        offset += 32; // 移动到下一个字段描述
    }

    const records: Array<{ [key: string]: any }> = [];
    for (let i = 0; i < header.recordCount; i++) {
        const record: { [key: string]: any } = {};

        let recordOffset = offset;

        // 检查删除标记
        const deleteFlag = dataView.getUint8(recordOffset);
        recordOffset += 1; // 跳过删除标识

        if (deleteFlag !== 0x2A) {
            for (const field of fields) {
                const rawValue = textDecoder.decode(getArrayBufferFromDataView(dataView, recordOffset, field.length))?.trim();
                let parsedValue: any = rawValue;

                if (rawValue && rawValue.toUpperCase() !== "NULL") {
                    switch (field.type) {
                        case "N": // 数字
                        case "F": // 浮点
                            parsedValue = parseFloat(rawValue);
                            break;
                        case "I": // 整数
                            parsedValue = parseInt(rawValue);
                            break;
                        case "D":
                            if (rawValue?.length === 8) {
                                const year = parseInt(rawValue.substring(0, 4), 10);
                                const month = parseInt(rawValue.substring(4, 6), 10);
                                const day = parseInt(rawValue.substring(6, 8), 10);
                                parsedValue = new Date(year, month - 1, day);
                            }
                            break;

                        case "L":
                            const char = rawValue.toUpperCase();
                            parsedValue = char === 'T' || char === 'Y';
                            break;
                    }
                }

                record[field.name] = parsedValue;
                recordOffset += field.length; // 移动到下一个字段
            }

            records.push(record);
        }

        offset += header.recordLength;
    }

    return records;
}

export function writeDbf(options: {
    data: Array<GeoJSON.GeoJsonProperties> | Array<GeoJSON.Feature> | GeoJSON.FeatureCollection,
    encoding?: string
}) {
    const data = options.data instanceof Array ? options.data : options.data.features;

    // 手机字段
    const fieldsMap = new Map<string, Map<DbfField['type'] | "UNDEFINED", { jsType: TJSType, maxStrLength: number }>>();
    data.forEach(item => {
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

            const dbfFieldType = JSTypeToDbfType(valueType);
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
    const fieldDefs = new Map<string, { type: DbfField['type'], length: number }>();

    for (const [key, fields] of fieldsMap) {
        if (fields.size === 1) {
            const field = fields.entries().next().value!;
            const type = field[0] === 'UNDEFINED' ? 'C' : field[0];
            fieldDefs.set(key, { type, length: field[1].maxStrLength });
        }
        else {
            const types = Array.from(fields.keys());

            // 包括空值的字段类型
            if (types.length === 2 && types.includes("UNDEFINED")) {
                const type = types[(types.indexOf("UNDEFINED") + 1) % 2] as DbfField['type'];
                fieldDefs.set(key, { type, length: fields.get(type)!.maxStrLength });
            }
            else {
                fieldDefs.set(key, { type: "C", length: Array.from(fields.values()).reduce((a, b) => Math.max(a, b.maxStrLength), 0) })
            }
        }
    }

    // 写入数据
    const headerDataView= new DataView(new ArrayBuffer(32 + fieldDefs.size * 32 + 1));
}
