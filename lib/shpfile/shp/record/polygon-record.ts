/**
 *  position             Field Name     Type                     Byte Order        Length
 *  0                    Shape Type     Integer                  Little Endian     4
 *  4                    Box            Double[4]                Little Endian     8 * 4
 *  36                   NumParts       Integer                  Little Endian     4
 *  40                   NumPoints      Integer                  Little Endian     4
 *  44                   Parts          Integer[NumParts]        Little Endian     4 * NumParts
 *  44 + 4 * NumParts    Points         Double[2 * NumPoints]    Little Endian     8 * 2 * NumPoints
 */


import { ShpRecord } from "./shp-record";
import { bbox, flatGeometry, isClockwise } from '../../../utils';
import { ShapeType } from "../../shape-type";

export class PolygonRecord extends ShpRecord<GeoJSON.Polygon | GeoJSON.MultiPolygon> {
    protected onRead(view: DataView, byteOffset: number): GeoJSON.Polygon | GeoJSON.MultiPolygon {
        const bbox = this.readArrayFloat64(view, byteOffset + 4, 4) as GeoJSON.BBox;
        const numParts = view.getInt32(byteOffset + 36, true);
        const numPoints = view.getInt32(byteOffset + 40, true);
        const parts = this.readArrayInt32(view, byteOffset + 44, numParts);
        const coordinates = this.readCoordinates(view, byteOffset + 44 + 4 * numParts, numPoints);

        const polygons = parts.reduce((p, seek, i, arr) => {
            const nextSeek = arr[i + 1];
            const ring = coordinates.slice(seek, nextSeek);

            if (isClockwise(ring)) {
                // 顺时针为新的多边形
                p.push([ring]);
            } else {
                // 如果逆时针则为左侧多边形的洞
                p[p.length - 1].push(ring);
            }
            return p;
        }, [] as GeoJSON.Position[][][]);

        if (polygons.length === 1) {
            return {
                type: "Polygon",
                bbox,
                coordinates: polygons[0]
            }
        } else {
            return {
                type: 'MultiPolygon',
                bbox,
                coordinates: polygons
            }
        }
    }
    protected onWrite(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): ArrayBuffer {
        const geoType = geometry.type;
        const box = bbox(geometry);
        const coordinates = flatGeometry(geometry);
        const numParts = geoType === 'Polygon' ? geometry.coordinates.length : geometry.coordinates.reduce((p, c) => p + c.length, 0);
        const parts = geoType === 'Polygon' ? geometry.coordinates.map(ring => coordinates.indexOf(ring[0])) :
            geometry.coordinates.reduce((p, c) => [...p, ...c.map(ring => coordinates.indexOf(ring[0]))], [] as number[]);

        const view = new DataView(new ArrayBuffer(44 + 4 * numParts + 8 * 2 * coordinates.length));
        view.setInt32(0, ShapeType.Polygon, true);
        this.setArrayFloat64(view, 4, box);
        view.setInt32(36, numParts, true);
        view.setInt32(40, coordinates.length, true);
        this.setArrayInt32(view, 44, parts);
        this.writeCoordinates(view, 44 + 4 * numParts, coordinates);

        return view.buffer;
    }
}