import iconv from 'iconv-lite';
import { DbfField } from './type';

export function getDbfFields(data: Array<{ [key: string]: any }> | Array<GeoJSON.Feature>, encoding?: string): Array<DbfField> {
    const fields = new Array<DbfField>();

    encoding ??= 'utf-8';

    data.forEach((item, index) => {

        const isLast = index === data.length - 1;

        for (const key in item) {
            const value = item[key];
            const valueType = typeof value;

            // 最后一个数据
            if (isLast) {

            }
        }


    });

    return fields;
}