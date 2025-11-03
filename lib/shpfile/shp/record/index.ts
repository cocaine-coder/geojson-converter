import { ShapeType } from '../../shape-type';
import { MultiPointMRecord } from './multi-point-m-record';
import { MultiPointRecord } from './multi-point-record';
import { MultiPointZRecord } from './multi-point-z-record';
import { PointMRecord } from './point-m-record';
import { PointRecord } from './point-record';
import { PointZRecord } from './point-z-record';
import { PolygonMRecord } from './polygon-m-record';
import { PolygonRecord } from './polygon-record';
import { PolygonZRecord } from './polygon-z-record';
import { PolylineMRecord } from './polyline-m-record';
import { PolylineRecord } from './polyline-record';
import { PolylineZRecord } from './polyline-z-record';
import { ShpRecord } from './shp-record';

export function createReadRecord(shapeType: ShapeType): ShpRecord {
    switch (shapeType) {
        case ShapeType.Point: return new PointRecord();
        case ShapeType.PointM: return new PointMRecord();
        case ShapeType.PointZM: return new PointZRecord();
        case ShapeType.MultiPoint: return new MultiPointRecord();
        case ShapeType.MultiPointM: return new MultiPointMRecord();
        case ShapeType.MultiPointZM: return new MultiPointZRecord();
        case ShapeType.PolyLine: return new PolylineRecord();
        case ShapeType.PolyLineM: return new PolylineMRecord();
        case ShapeType.PolyLineZM: return new PolylineZRecord();
        case ShapeType.Polygon: return new PolygonRecord();
        case ShapeType.PolygonM: return new PolygonMRecord();
        case ShapeType.PolygonZM: return new PolygonZRecord();
        case ShapeType.NullShape:
        default:
            throw new Error(`ShapeType ${shapeType} is not supported`);
    }
}

export type TCanWriteGeoJSONGeometry = Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection>;
export type TWriteExtraType = "M" | "Z";

export function createWriteRecord(geojsonGeometryType: TCanWriteGeoJSONGeometry['type'], extra?: TWriteExtraType): [ShpRecord, ShapeType] {
    switch (geojsonGeometryType) {
        case 'Point':
            if (extra === 'M') return [new PointMRecord(), ShapeType.PointM];
            if (extra === 'Z') return [new PointZRecord(), ShapeType.PointZM];
            return [new PointRecord(), ShapeType.Point];

        case "MultiPoint":
            if (extra === 'M') return [new MultiPointMRecord(), ShapeType.MultiPointM];
            if (extra === 'Z') return [new MultiPointZRecord(), ShapeType.MultiPointZM];
            return [new MultiPointRecord(), ShapeType.MultiPoint];

        case "LineString":
        case "MultiLineString":
            if (extra === 'M') return [new PolylineMRecord(), ShapeType.PolyLineM];
            if (extra === 'Z') return [new PolylineZRecord(), ShapeType.PolyLineZM];
            return [new PolylineRecord(), ShapeType.PolyLine];

        case "Polygon":
        case "MultiPolygon":
            if (extra === 'M') return [new PolygonMRecord(), ShapeType.PolygonM];
            if (extra === 'Z') return [new PolygonZRecord(), ShapeType.PolygonZM];
            return [new PolygonRecord(), ShapeType.Polygon];
    }
}

export {
    ShpRecord
} 