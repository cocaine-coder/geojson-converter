import { readShp, writeShp } from './shp';
import { readDbf, writeDbf } from './dbf';
import { TFileLike, transformCoorinates } from '../utils';
import proj4 from 'proj4';

export function readShpFile(options: {
    shp: TFileLike,
    dbf: TFileLike,
    encoding?: string,
    crs?: string
}) {
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

export function writeShpFile(options: {
    data: GeoJSON.FeatureCollection | Array<GeoJSON.Feature>,
    encoding?: string,
    crs?: string
}) {
    options.encoding ??= "utf-8";
    let data = options.data instanceof Array ? options.data : options.data.features;
    data = data.filter(x => {
        if (options.crs) {
            x.geometry = transformCoorinates(x.geometry, proj4.WGS84, options.crs);
        }

        return x.geometry.type !== 'GeometryCollection';
    });

    const shpData = writeShp({ data: data as any });
    const dbfData = writeDbf({ data: data, encoding: options.encoding });
    const prjData = new TextEncoder().encode(options.crs || "");
    const cpgData = new TextEncoder().encode(options.encoding.toUpperCase());

    return { ...shpData, dbf: dbfData, prj: prjData.buffer, cpg: cpgData.buffer }
}

export { readShp, writeShp, readDbf, writeDbf };