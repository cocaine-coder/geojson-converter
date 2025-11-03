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
        recordCount: dataView.getInt32(4, true), // 小端序
        headerLength: dataView.getInt16(8, true),
        recordLength: dataView.getInt16(10, true)
    };

    console.log(dataView.getUint8(29));

    // 计算字段数量
    const fieldCount = (header.headerLength - 33) / 32; // 头长度减去基础头和终止符，除以每个字段描述块的大小
    const fields: DbfField[] = [];

    let offset = 32; // 跳过基础头，开始读取字段描述

    for (let i = 0; i < fieldCount; i++) {
        let nameLength = 0;
        for (let j = 0; j < 11; j++) {
            if (dataView.getUint8(offset + j) === 0x00) break;
            nameLength++;
        }
        const nameArrayBuffer = dataView.buffer.slice(dataView.byteOffset + offset,
            dataView.byteOffset + offset + nameLength);
        const name = new TextDecoder().decode(nameArrayBuffer);

        const type = String.fromCharCode(dataView.getUint8(offset + 11));
        const length = dataView.getUint8(offset + 12);
        const decimalPlaces = dataView.getUint8(offset + 13);

        fields.push({ name, type, length, decimalPlaces });
        offset += 32; // 移动到下一个字段描述
    }

    console.log(header, fields);
}

export function writeDbf() { }
