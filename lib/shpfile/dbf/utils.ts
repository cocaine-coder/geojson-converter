import { DbfField } from './type';

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

export function jsDataToDbfStr(val: any, type: DbfField['type'], length: number) {
    if (val === undefined || val === null)
        return "".padEnd(length, " ");

    switch (type) {
        case "N":
        case "F":
        case "I":
        case "C":
            return String(val).padEnd(length, " ");
        case "D":
            return `${val.getFullYear()}${(val.getMonth() + 1).toString().padStart(2, '0')}${val.getDate().toString().padStart(2, '0')}`;
        case "L":
            return val ? "T" : "F";
    }
}