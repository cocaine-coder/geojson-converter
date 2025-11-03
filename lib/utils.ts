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

export const ldidToEncoding: { [key: number]: string } = {
    0x98: "GBK",
    0X4D: "GBK",
    0x4F: "Big5",
    0x03: 'Windows-1252',
    0x57: 'Windows-1252',
    0x58: 'Windows-1252',
    0x59: 'Windows-1252',
}