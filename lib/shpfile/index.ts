import { readShp, writeShp } from './shp';
import { readDbf, writeDbf } from './dbf';
import { groupBy, TFileLike, transformCoorinates } from '../utils';
import proj4 from 'proj4';
import * as zip from '@zip.js/zip.js';

type TReadOptions = {
    shp: TFileLike,
    dbf: TFileLike,
    encoding?: string,
    crs?: string
}

type TWriteOptions = {
    data: GeoJSON.FeatureCollection | Array<GeoJSON.Feature>,
    encoding?: string,
    crs?: string
}

export function readShpFile(options: TReadOptions) {
    const shpData = readShp({ file: options.shp });
    const dbfData = readDbf({ file: options.dbf, encoding: options.encoding });

    const features = new Array<GeoJSON.Feature>();
    shpData.geometries.forEach((geometry, index) => {
        const properties = dbfData[index];
        if (!properties) throw new Error(`properties is undefined,index : ${index}`);

        // 坐标转换
        if (options.crs) {
            geometry = transformCoorinates(geometry, options.crs, proj4.WGS84);
        }

        features.push({
            type: 'Feature',
            geometry,
            properties: dbfData[index]
        });
    });

    return { type: 'FeatureCollection', features };
}

export function writeShpFile(options: TWriteOptions) {
    options.encoding ??= "utf-8";
    let data = options.data instanceof Array ? options.data : options.data.features;
    data = data.filter(x => {
        if (options.crs) {
            x.geometry = transformCoorinates(x.geometry, proj4.WGS84, options.crs);
        }

        return x.geometry.type !== 'GeometryCollection';
    });

    const shpTypedData = groupBy(data, x => {
        switch (x.geometry.type) {
            case "Point": return "POINT";
            case "MultiPoint": return "MULTIPOINT";
            case "LineString":
            case "MultiLineString": return "POLYLINE";
            case "Polygon":
            case "MultiPolygon": return "POLYGON";
            case "GeometryCollection": throw new Error("GeometryCollection is not supported");
        }
    });

    const result = new Array<{
        name: string,
        data: {
            shp: ArrayBuffer,
            shx: ArrayBuffer;
            dbf: ArrayBuffer,
            prj: ArrayBuffer,
            cpg: ArrayBuffer
        }
    }>();
    for (const [key, value] of shpTypedData) {
        const shpData = writeShp({ data: value as any });
        const dbfData = writeDbf({ data: value, encoding: options.encoding });
        const prjData = new TextEncoder().encode(options.crs || "");
        const cpgData = new TextEncoder().encode(options.encoding.toUpperCase());

        result.push({
            name: key,
            data: {
                ...shpData, dbf: dbfData, prj: prjData.buffer, cpg: cpgData.buffer
            }
        });
    }

    return result;
}

export { readShp, writeShp, readDbf, writeDbf };


export async function readFromZip(file: Blob | ArrayBuffer) {
    if (file instanceof ArrayBuffer) {
        file = new Blob([file], { type: 'application/zip' });
    }

    const zipReader = new zip.ZipReader(new zip.BlobReader(file));

    const entries = await zipReader.getEntries();

    entries.forEach(entry=>{
        
    });
}

export async function writeToZip(options: TWriteOptions) {
    const temp = writeShpFile(options);

    const blobWriter = new zip.BlobWriter("application/zip");
    const zipWriter = new zip.ZipWriter(blobWriter);

    const tasks = temp.reduce((p, x) => {
        for (const [extensions, buffers] of Object.entries(x.data)) {
            const blobReader = new zip.Uint8ArrayReader(new Uint8Array(buffers));
            p.push(zipWriter.add(x.name + "." + extensions, blobReader));
        }

        return p;
    }, new Array<Promise<any>>());

    await Promise.all(tasks);
    await zipWriter.close();

    return await blobWriter.getData();
}