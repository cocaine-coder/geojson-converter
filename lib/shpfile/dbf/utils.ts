import { DbfField } from './type';


export type TJSType = "string" | "number" | "bigint" | "boolean" | "undefined" | "object";


export function inferDbfType(val: any): DbfField['type'] | "UNDEFINED" {
    const type = typeof val;
    switch (type) {
        case "bigint":
        case "number":
            return "N";
        case "boolean":
            return "L";
        case "undefined":
            return "UNDEFINED";
        case "object":
            if (val instanceof Date) {
                return "D";
            };
            return "C";
        default:
            return "C";
    }
}

export function inferDbfFieldLength(type: DbfField['type'], maxStrLength: number, encoding: string) {
    const encodingUpper = encoding.toUpperCase();

    switch (type) {
        case "N":
        case "F":
        case "I":
            return maxStrLength + 1;
        case "D":
            return 8;
        case "L":
            return 1;
        case "C":
            return encodingUpper === "UTF-8" ? maxStrLength * 3 : maxStrLength * 2;
    }
}