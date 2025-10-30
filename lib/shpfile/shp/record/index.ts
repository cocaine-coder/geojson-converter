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

export const shapetype_record_read_map = new Map<ShapeType, () => ShpRecord>([
    [ShapeType.Point, () => new PointRecord()],
    [ShapeType.PointM, () => new PointMRecord()],
    [ShapeType.PointZM, () => new PointZRecord()],
    [ShapeType.MultiPoint, () => new MultiPointRecord()],
    [ShapeType.MultiPointM, () => new MultiPointMRecord()],
    [ShapeType.MultiPointZM, () => new MultiPointZRecord()],

    [ShapeType.PolyLine, () => new PolylineRecord()],
    [ShapeType.PolyLineM, () => new PolylineMRecord()],
    [ShapeType.PolygonZM, () => new PolylineZRecord()],

    [ShapeType.Polygon, () => new PolygonRecord()],
    [ShapeType.PolygonM, () => new PolygonMRecord()],
    [ShapeType.PolygonZM, () => new PolygonZRecord()],
]);

export const geojson_record_write_map = new Map<GeoJSON.GeoJsonTypes, ()=> ShpRecord>([
    ['Point', () => new PointRecord()],
    ['MultiPoint', ()=> new MultiPointRecord()]
]); 

export {
    ShpRecord
}