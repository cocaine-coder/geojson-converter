import iconv from 'iconv-lite';
import { DbfField } from './type';


type TBaseType = "string" | "number" | "bigint" | "boolean" | "undefined" | "object";

/**
 * 确定filed 及其类型
 * @param data 
 */
export function getFieldDefs(data: Array<GeoJSON.GeoJsonProperties> | Array<GeoJSON.Feature>): Array<DbfField> {
    const map = new Map<string, Map<TBaseType, DbfField | undefined>>();

    data.forEach((item, index) => {
        
    });
}