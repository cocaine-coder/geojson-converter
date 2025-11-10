import { DbfField } from './type';


export type TJSType = "string" | "number" | "bigint" | "boolean" | "undefined" | "object";

export function JSTypeToDbfType(type: TJSType): DbfField['type'] | "UNDEFINED" {
    switch(type){
        case "string":
            return "C";
        case "number":
            return "N";
        case "bigint":
            return "N";
        case "boolean":
            return "L";
        case "undefined":
            return "C";
        case "object":
            return "C";
        default:
            return "C";
    }
}