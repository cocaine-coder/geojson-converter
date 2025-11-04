import { getArrayBufferFromDataView } from "../../utils";
import { DbfField, DbfHeader } from "./type";

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
        const type = String.fromCharCode(dataView.getUint8(offset + 11));
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

        console.log(recordOffset);
        console.log(offset);
    }

    return records;
}

export function writeDbf(options: {
    data: Array<any> | Array<GeoJSON.Feature> | GeoJSON.FeatureCollection,
    encoding?: string
}) {
    if (!(options.data instanceof Array)) {
        options.data = options.data.features;
    }

    const propertiesArrayBuffers = options.data.map(item => {

    });
}
