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

export function flatGeometry(geometry: GeoJSON.Geometry): Array<GeoJSON.Position> {
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