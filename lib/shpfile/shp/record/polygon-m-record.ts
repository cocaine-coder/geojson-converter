/**
 *  position             Field Name     Type                     Byte Order        Length
 *  0                    Shape Type     Integer                  Little Endian     4
 *  4                    Box            Double[4]                Little Endian     8 * 4
 *  36                   NumParts       Integer                  Little Endian     4
 *  40                   NumPoints      Integer                  Little Endian     4
 *  44                   Parts          Integer[NumParts]        Little Endian     4 * NumParts
 *  X                    Points         Double[2 * NumPoints]    Little Endian     8 * 2 * NumPoints
 *  Y                    Mmin           Double                   Little Endian     8
 *  Y + 8                Mmax           Double                   Little Endian     8
 *  Y + 16               Marray         Double[NumPoints]        Little Endian     8 * NumPoints        
 * 
 *  X = 44 + 4 * NumParts
 *  Y = X + 2 * 8 * NumPoints
 */

import { flatGeometry, mergeArrayBuffers } from "../../../utils";
import { PolygonRecord } from "./polygon-record";

export class PolygonMRecord extends PolygonRecord {

    protected onWrite(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): ArrayBuffer {
        const coordinates = flatGeometry(geometry);

        const view = new DataView(new ArrayBuffer(16 + 8 * coordinates.length));
        view.setFloat64(0, 0, true);
        view.setFloat64(8, 0, true);
        this.setArrayFloat64(view, 16, Array(coordinates.length).fill(0));

        return mergeArrayBuffers([super.onWrite(geometry), view.buffer]);
    }
}