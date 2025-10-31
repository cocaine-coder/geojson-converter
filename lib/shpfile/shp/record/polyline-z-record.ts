/**
 *  position             Field Name     Type                     Byte Order        Length
 *  0                    Shape Type     Integer                  Little Endian     4
 *  4                    Box            Double[4]                Little Endian     8 * 4
 *  36                   NumParts       Integer                  Little Endian     4
 *  40                   NumPoints      Integer                  Little Endian     4
 *  44                   Parts          Integer[NumParts]        Little Endian     4 * NumParts
 *  X                    Points         Double[2 * NumPoints]    Little Endian     8 * 2 * NumPoints
 *  Y                    Zmin           Double                   Little Endian     8
 *  Y + 8                Zmax           Double                   Little Endian     8
 *  Y + 16               Zarray         Double[NumPoints]        Little Endian     8 * NumPoints
 *  Z                    Mmin           Double                   Little Endian     8
 *  Z + 8                Mmax           Double                   Little Endian     8
 *  Z + 16               Marray         Double[NumPoints]        Little Endian     8 * NumPoints
 *  
 *  X = 44 + (4 * NumParts)
 *  Y = X + (2 * 8 * NumPoints)
 */

import { flatGeometry, mergeArrayBuffers } from "../../../utils";
import { PolylineRecord } from "./polyline-record";

export class PolylineZRecord extends PolylineRecord {
    protected onRead(view: DataView, byteOffset: number): GeoJSON.LineString | GeoJSON.MultiLineString {
        const polyline = super.onRead(view, byteOffset);
        const coordinates = flatGeometry(polyline);

        const numParts = polyline.type === 'LineString' ? 1 : polyline.coordinates.length;
        const numPoints = coordinates.length;

        const zs = this.readArrayFloat64(view, byteOffset + 44 + (4 * numParts) + (2 * 8 * numPoints) + 16, numPoints);
        coordinates.forEach((coord, i) => {
            coord[2] = zs[i];
        });

        return polyline;
    }

    protected onWrite(geometry: GeoJSON.LineString | GeoJSON.MultiLineString): ArrayBuffer {
        const coordinates = flatGeometry(geometry);
        const zs = coordinates.map(coord => coord[2]);
        const minZ = Math.min(...zs);
        const maxZ = Math.max(...zs);

        const view = new DataView(new ArrayBuffer(2 * (16 + 8 * zs.length)));
        view.setFloat64(0, minZ, true);
        view.setFloat64(8, maxZ, true);
        this.setArrayFloat64(view, 16, zs);
        view.setFloat64(16 + (8 * zs.length), 0, true);
        view.setFloat64(16 + (8 * zs.length) + 8, 0, true);
        this.setArrayFloat64(view, 16 + (8 * zs.length) + 16, Array(coordinates.length).fill(0));

        return mergeArrayBuffers([super.onWrite(geometry), view.buffer]);
    }
}