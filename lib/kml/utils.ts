import { IBoundary, ILinearRing, ILineString, IPlacemark, IPoint, IPolygon, TMayBeArray } from "./schema";

export function toCoordinates(g: GeoJSON.Point | GeoJSON.LineString | GeoJSON.Position[]) {
    if (g instanceof Array) return g.reduce((p, c) => p + c.join(",") + "\n", "");
    if (g.type === 'LineString') return toCoordinates(g.coordinates);
    return g.coordinates.join(",");
}

export function toPositions(coordinates: string): GeoJSON.Position[] {
    return coordinates.split("\n").map(c => c.split(",").map(Number));
}

export function actionMaybeArray<T>(data: TMayBeArray<T>, fn: (data: T) => void) {
    if (data instanceof Array) {
        data.forEach(fn);
    } else {
        fn(data);
    }
}

export function toPlacemark(g: GeoJSON.Geometry): IPlacemark {
    switch (g.type) {
        case "Point":
            return {
                Point: {
                    coordinates: toCoordinates(g)
                }
            }
        case "MultiPoint":
            return {
                Point: g.coordinates.map<IPoint>(p => ({
                    coordinates: toCoordinates({
                        type: "Point",
                        coordinates: p,
                    })
                }))
            }
        case "LineString":
            return {
                LineString: {
                    coordinates: toCoordinates(g)
                }
            }
        case "MultiLineString":
            return {
                LineString: g.coordinates.map<ILineString>(p => ({
                    coordinates: toCoordinates({
                        type: 'LineString',
                        coordinates: p
                    })
                }))
            }

        case "Polygon":
            return {
                Polygon: {
                    outerBoundaryIs: {
                        LinearRing: {
                            coordinates: toCoordinates(g.coordinates[0])
                        }
                    },
                    innerBoundaryIs: g.coordinates.length <= 1 ? undefined : g.coordinates.slice(1).map<IBoundary>(p => ({
                        LinearRing: {
                            coordinates: toCoordinates(p)
                        }
                    }))
                }
            }

        case "MultiPolygon":
            return {
                Polygon: g.coordinates.map<IPolygon>(p => ({
                    outerBoundaryIs: {
                        LinearRing: {
                            coordinates: toCoordinates(p[0])
                        }
                    },
                    innerBoundaryIs: p.length <= 1 ? undefined : p.slice(1).map<IBoundary>(q => ({
                        LinearRing: {
                            coordinates: toCoordinates(q)
                        }
                    }))
                }))
            }

        case "GeometryCollection":
            const placemark: IPlacemark = {};
            const absorb = (type: "Point" | "LineString" | "Polygon", p2: IPlacemark) => {
                if (!placemark[type]) placemark[type] = [];
                const gs1 = placemark[type] as Array<any>;
                const gs2 = p2[type];

                if (!gs2) return;

                if (gs2 instanceof Array) {
                    gs1.push(...gs2);
                } else {
                    gs1.push(gs2);
                }
            }

            const fill = (gg: GeoJSON.Geometry) => {
                if (gg.type === 'GeometryCollection')
                    gg.geometries.forEach(fill);
                else {
                    const temp = toPlacemark(gg);
                    absorb("Point", temp);
                    absorb("LineString", temp);
                    absorb("Polygon", temp);
                }
            }

            fill(g);

            return placemark;
    }
}

export function toGeometry(p: IPlacemark): GeoJSON.Geometry | undefined {
    const gs = new Array<Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection>>();

    if (p.Point) {
        actionMaybeArray(p.Point, item => {
            gs.push({
                type: 'Point',
                coordinates: toPositions(item.coordinates)[0]
            })
        });
    }

    if (p.LineString) {
        actionMaybeArray(p.LineString, item => {
            gs.push({
                type: "LineString",
                coordinates: toPositions(item.coordinates)
            });
        });
    }

    if (p.Polygon) {
        actionMaybeArray(p.Polygon, item => {
            const polygon: GeoJSON.Polygon = { type: "Polygon", coordinates: [] };
            polygon.coordinates.push(toPositions(item.outerBoundaryIs.LinearRing.coordinates));

            if (item.innerBoundaryIs) {
                actionMaybeArray(item.innerBoundaryIs, innerItem => {
                    polygon.coordinates.push(toPositions(innerItem.LinearRing.coordinates));
                });
            }
        });
    }

    if (gs.length === 0) return undefined;
    if (gs.length === 1) return gs[0];
    if (gs.every(x => x.type === gs[0].type)) { // Multi
        return {
            type: `Multi${gs[0].type}`,
            coordinates: gs.map(x => x.coordinates)
        } as GeoJSON.Geometry;
    } else {
        return {
            type: "GeometryCollection",
            geometries: gs
        }
    }
}