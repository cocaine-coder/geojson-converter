import { SHPFILE } from '../../lib';
import fs from 'fs';
import { describe, expect, test } from 'vitest';
import path from 'path';

describe("geojson 与 shpfile 转换", () => {
    test("shpfile 转 geojson", async () => {
        const zipFile = fs.readFileSync(path.resolve(__dirname, '../mock/shp/点.zip'));
        const value = await SHPFILE.readFromZip(zipFile.buffer);

        expect(value).not.toBeNull();
        expect(value).not.toBeUndefined();
        expect(value).length.greaterThan(0);
        expect(value[0].data.features).length.greaterThan(0);
    });

    test("geojson 转 shpfile", async () => {
        const geojson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../mock/1.geojson'), { encoding: "utf-8" }));
        const blob = await SHPFILE.writeToZip({ data: geojson });
        const arrayBuffer = await blob.arrayBuffer();
        fs.writeFileSync(path.resolve(__dirname, "../temp/1.zip"), new Uint8Array(arrayBuffer), {});
    });
});