export const dbf_type_length = {
    // string
    C: 254,
    // boolean
    L: 1,
    // date
    D: 8,
    // number
    I: 8,
    // number
    N: 18,
    // number, float
    F: 18,
    // number
    B: 8,
} as const;

export const js_type_to_dbf_type = {
    string: "C",
    number: "N",
    bigint: "N",
    boolean: "L",
    undefined: undefined,
    object: "C",
    date: "D",
} as const;

export type TDbfType = keyof typeof dbf_type_length;

export interface DbfHeader {
    lastUpdated: Date;
    recordCount: number;
    headerLength: number;
    recordLength: number;
}

export interface DbfField {
    name: string;
    type: TDbfType;
    length: number;
    decimals: number;
}

/**
 * 获取编码
 * @param ldid 
 * @returns
 */
export const ldidToEncoding: { [key: number]: string } = {
    0x98: "GBK",
    0X4D: "GBK",
    0x4F: "Big5",
    0x03: 'Windows-1252',
    0x57: 'Windows-1252',
    0x58: 'Windows-1252',
    0x59: 'Windows-1252',
}