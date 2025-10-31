/**
 *  position             Field Name     Type                     Byte Order        Length
 *  0                    Shape Type     Integer                  Little Endian     4
 *  4                    Box            Double[4]                Little Endian     8 * 4
 *  36                   NumParts       Integer                  Little Endian     4
 *  40                   NumPoints      Integer                  Little Endian     4
 *  44                   Parts          Integer[NumParts]        Little Endian     4 * NumParts
 *  44 + 4 * NumParts    Points         Double[2 * NumPoints]    Little Endian     8 * 2 * NumPoints
 */

import { bbox, flatGeometry } from "../../../utils";
import { ShapeType } from "../../shape-type";
import { ShpRecord } from "./shp-record";

export class PolylineRecord extends ShpRecord<GeoJSON.LineString | GeoJSON.MultiLineString> {
    protected onRead(view: DataView, byteOffset: number): GeoJSON.LineString | GeoJSON.MultiLineString {
        const bbox = this.readArrayFloat64(view, byteOffset + 4, 4) as GeoJSON.BBox;
        const numParts = view.getInt32(byteOffset + 36, true);
        const numPoints = view.getInt32(byteOffset + 40, true);
        const parts = this.readArrayInt32(view, byteOffset + 44, numParts);
        const coordinates = this.readCoordinates(view, byteOffset + 44 + 4 * numParts, numPoints);

        const lines = parts.reduce((p, seek, i, arr) => {
            const nextSeek = arr[i + 1];
            p.push(coordinates.slice(seek, nextSeek));
            return p;
        }, [] as GeoJSON.Position[][]);

        if (lines.length === 1) {
            return {
                type: "LineString",
                bbox,
                coordinates: lines[0]
            }
        } else {
            return {
                type: "MultiLineString",
                bbox,
                coordinates: lines
            }
        }
    }

    protected onWrite(geometry: GeoJSON.LineString | GeoJSON.MultiLineString): ArrayBuffer {
        const geoType = geometry.type;
        const coordinates = flatGeometry(geometry);
        const box = bbox(geometry);
        const numParts = geoType === 'LineString' ? 1 : geometry.coordinates.length;
        const parts = geoType === 'LineString' ? [0] : geometry.coordinates.map(line => coordinates.indexOf(line[0]));

        const view = new DataView(new ArrayBuffer(44 + 4 * numParts + 8 * 2 * coordinates.length));
        view.setInt32(0, ShapeType.PolyLine, true);
        this.setArrayFloat64(view, 4, box);
        view.setInt32(36, numParts, true);
        view.setInt32(40, coordinates.length, true);
        this.setArrayInt32(view, 44, parts);
        this.writeCoordinates(view, 44 + 4 * numParts, coordinates);

        return view.buffer;
    }
}