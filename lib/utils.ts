import proj4 from 'proj4';
import { PROJJSONDefinition } from 'proj4/dist/lib/core';
import Projection from 'proj4/dist/lib/Proj';

export const contracts = {
    crs: {
        proj: {
            wgs84: "+proj=longlat +datum=WGS84 +no_defs +type=crs"
        },
        wkt: {
            wgs84: `GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]`
        }
    }
} as const;

export type TFileLike = { buffer: ArrayBuffer; byteOffset?: number; byteLength?: number; }

/**
 * 将数组通过keySelector进行分组
 * @param data 
 * @param keySelector 
 * @returns 
 */
export function groupBy<TV, TK>(data: Array<TV>, keySelector: (item: TV) => TK): Map<TK, Array<TV>> {
    const result = new Map<TK, Array<TV>>();

    data.forEach(item => {
        const key = keySelector(item);
        if (result.has(key)) {
            result.get(key)?.push(item);
        } else {
            result.set(key, [item]);
        }
    });

    return result;
}

/**
 * 判断一组点是否是顺时针方向
 * @param points 
 * @returns 
 */
export function isClockwise(points: GeoJSON.Position[]): boolean | undefined {
    if (points.length < 3) {
        console.warn("Not enough points to determine clockwise direction.");
        return undefined;
    }

    let area = 0;
    const n = points.length;

    for (let i = 0; i < n; i++) {
        const currentPoint = points[i];
        const nextPoint = points[(i + 1) % n];

        area += currentPoint[0] * nextPoint[1] - currentPoint[1] * nextPoint[0];
    }

    if (area > 0) return true;
    if (area < 0) return false;

    console.warn("Points are colinear.");
    return undefined;
}

/**
 * 将数据压平坐标数组
 * @param geometry 
 * @returns 
 */
export function flatGeometry(geometry: GeoJSON.Geometry | GeoJSON.Feature | Array<GeoJSON.Geometry> | Array<GeoJSON.Feature>): Array<GeoJSON.Position> {
    if (geometry instanceof Array) {
        return geometry.reduce((acc, item) => acc.concat(flatGeometry(item)), [] as Array<GeoJSON.Position>);
    }

    if (geometry.type === "Feature") {
        return flatGeometry(geometry.geometry);
    }

    switch (geometry.type) {
        case "Point": return [geometry.coordinates];
        case "MultiPoint":
        case "LineString": return geometry.coordinates;
        case "MultiLineString":
        case "Polygon": return geometry.coordinates.reduce((acc, ring) => acc.concat(ring), [] as Array<GeoJSON.Position>);
        case "MultiPolygon": return geometry.coordinates.reduce((acc, polygon) => acc.concat(polygon.reduce((acc1, ring) => acc1.concat(ring), [] as Array<GeoJSON.Position>)), [] as Array<GeoJSON.Position>);
        case "GeometryCollection": return geometry.geometries.reduce((acc, geometry) => acc.concat(flatGeometry(geometry)), [] as Array<GeoJSON.Position>);
    }
}

/**
 * 计算几何对象的边界框
 * @param geometry 
 * @param includeZ 
 * @returns 
 */
export function bbox(geometry: GeoJSON.Geometry | Array<GeoJSON.Geometry> | Array<GeoJSON.Feature>, includeZ = false) {
    const coordinates = flatGeometry(geometry);

    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity, zmin = Infinity, zmax = -Infinity;

    coordinates.forEach(coord => {
        xmin = Math.min(xmin, coord[0]);
        xmax = Math.max(xmax, coord[0]);
        ymin = Math.min(ymin, coord[1]);
        ymax = Math.max(ymax, coord[1]);
        zmin = Math.min(zmin, coord[2] ?? 0);
        zmax = Math.max(zmax, coord[2] ?? 0);
    });

    const bbox = [xmin, ymin, xmax, ymax];
    return includeZ ? [...bbox, zmin, zmax] : bbox;
}

/**
 * 使用偏移获取DataView中的某一段ArrayBuffer
 * @param dataView 
 * @param byteOffset 
 * @param byteLength 
 * @returns 
 */
export function getArrayBufferFromDataView(dataView: DataView, byteOffset: number, byteLength: number) {
    return dataView.buffer.slice(dataView.byteOffset + byteOffset, dataView.byteOffset + byteOffset + byteLength);
}

/**
 * 合并多个ArrayBuffers
 * @param arrayBuffers 
 * @returns 
 */
export function mergeArrayBuffers(arrayBuffers: Array<ArrayBuffer>) {
    const totalLength = arrayBuffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
    const mergedArrayBuffer = new ArrayBuffer(totalLength);
    const resultView = new Uint8Array(mergedArrayBuffer);

    let offset = 0;
    for (const buffer of arrayBuffers) {
        resultView.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
    }

    return mergedArrayBuffer;
}

/**
 * 将geojson数据坐标转换
 * @param data 
 * @param fromProj 
 * @param toProj 
 * @returns 
 */
export function transformCoorinates<T extends GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.Geometry>(data: T, fromProj: string | PROJJSONDefinition | Projection, toProj: string | PROJJSONDefinition | Projection): T {
    if (data.type === 'FeatureCollection') {
        return {
            type: 'FeatureCollection',
            features: data.features.map(f => transformCoorinates(f, fromProj, toProj))
        } as T;
    }
    else if (data.type === 'Feature') {
        return {
            type: "Feature",
            geometry: transformCoorinates(data.geometry, fromProj, toProj),
            properties: data.properties
        } as T
    }
    else if (data.type === 'Point') {
        return {
            type: "Point",
            coordinates: proj4(fromProj, toProj, data.coordinates)
        } as T;
    }
    else if (data.type === "MultiPoint" || data.type === 'LineString') {
        return {
            type: data.type,
            coordinates: data.coordinates.map(x => proj4(fromProj, toProj, x))
        } as T;
    }
    else if (data.type === 'MultiLineString' || data.type === 'Polygon') {
        return {
            type: data.type,
            coordinates: data.coordinates.map(x => x.map(y => proj4(fromProj, toProj, y)))
        } as T;
    }
    else if (data.type === "MultiPolygon") {
        return {
            type: data.type,
            coordinates: data.coordinates.map(x => x.map(y => y.map(z => proj4(fromProj, toProj, z))))
        } as T;
    } else {
        return {
            type: "GeometryCollection",
            geometries: data.geometries.map(x => transformCoorinates(x, fromProj, toProj))
        } as T;
    }
}

export function proj4ToWkt( proj4Def: string){
    const p = proj4(proj4Def);

    if(!p.oProj)
        throw new Error(`Invalid proj4 definition : ${proj4Def}`);
    
    if((p.oProj as any)["projName"] === 'longlat'){
        return buildGeogcsWkt(p.oProj)
    }else{
        return buildProjcsWkt(p.oProj)
    }
}

function buildGeogcsWkt(projection: Projection){
    const datum : string = (projection as any).datumName || 'Datum_Unknown';
    const ellps = (projection as any).ellps || 'Sphere_Unknown';
    const a = projection.a || 6378137.0; // 默认 WGS84
    const b = projection.b || a;
    const f = projection.es || ((a * a - b * b) / (a * a));

    return `GEOGCS["GCS_${datum.replace(/\s+/g, '_')}", DATUM["${datum}", SPHEROID["${ellps}", ${a}, ${f.toFixed(10)}]], PRIMEM["Greenwich",0], UNIT["Degree",0.0174532925199433]]`;
}

function buildProjcsWkt(projection: Projection){ 
    const geogcsWkt = buildGeogcsWkt(projection);

    const params: string[] = [];
    params.push(`PROJECTION["${projection.names[0]}"]`);

    // 添加通用参数
    const proj = projection as any;
    if(proj.lat0 !== undefined) params.push(`PARAMETER["Latitude of Origin",${proj.lat0}]`);
    if (proj.lon0 !== undefined) params.push(`PARAMETER["Central Meridian",${proj.lon0}]`);
    if (proj.zone !== undefined) {
        params.push(`PARAMETER["Zone",${proj.zone}]`);
        // UTM 特殊处理，计算中央子午线
        if (proj.projName === 'utm' && proj.lon0 === undefined) {
            const centralMeridian = -183 + (proj.zone * 6);
            params.push(`PARAMETER["Central Meridian",${centralMeridian}]`);
        }
    }
    if (proj.x0 !== undefined) params.push(`PARAMETER["False Easting",${proj.x0}]`);
    if (proj.y0 !== undefined) params.push(`PARAMETER["False Northing",${proj.y0}]`);
    if (proj.k0 !== undefined) params.push(`PARAMETER["Scale Factor",${proj.k0}]`);

    // 单位
    const unit = proj.projName === 'longlat' ? 'Degree' : 'Meter';
    const unitValue = proj.projName === 'longlat' ? 0.0174532925199433 : 1.0;
    params.push(`UNIT["${unit}",${unitValue}]`);

     // 组合成最终的 PROJCS WKT
    const pcsName = `PCS_${proj.projName.toUpperCase()}_${proj.zone || ''}`.replace(/_+/g, '_').replace(/_$/, '');
    return `PROJCS["${pcsName}",${geogcsWkt},${params.join(',')}]`;
}