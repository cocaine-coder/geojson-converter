/**
 *  position             Field Name     Type                     Byte Order        Length
 *  0                    Shape Type     Integer                  Little Endian     4
 *  4                    Box            Double[4]                Little Endian     8 * 4
 *  36                   NumParts       Double                   Little Endian     4
 *  40                   NumPoints      Double                   Little Endian     4
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

import { flatGeometry } from "../../../utils";
import { PolygonRecord } from "./polygon-record";

export class PolygonZRecord extends PolygonRecord {
    protected onRead(view: DataView, byteOffset: number): GeoJSON.Polygon | GeoJSON.MultiPolygon {
        const polygon = super.onRead(view, byteOffset);
        const coordinates = flatGeometry(polygon);

        const numParts = polygon.type === 'Polygon' ? polygon.coordinates.length : polygon.coordinates.reduce((acc, rings) => acc + rings.length, 0);
        const numPoints = coordinates.length;

        const zs = this.readArrayFloat64(view, byteOffset + 44 + (4 * numParts) + (2 * 8 * numPoints) + 16, numPoints);
        coordinates.forEach((coord, i) => {
            coord[2] = zs[i];
        });

        return polygon;
    }
}