/**
 * position    Field             Type                       Byte Order          Length
 * 0           Shape Type        Integer                    Little Endian       4
 * 4           Box               Double[4]                  Little Endian       8
 * 36          NumPoints         Integer                    Little Endian       8
 * 40          Points            Double[2 * NumPoints]      Little Endian       8 * 2 * NumPoints
 * X           Mmin              Double                     Little Endian       8
 * X + 8       Mmax              Double                     Little Endian       8
 * X + 16      Marray            Double[NumPoints]          Little Endian       8 * NumPoints
 * 
 * X = 40 + (2 * 8 * NumPoints)
 */

import { flatGeometry, mergeArrayBuffers } from "../../../utils";
import { MultiPointRecord } from "./multi-point-record";

export class MultiPointMRecord extends MultiPointRecord {
    protected onWrite(geometry: GeoJSON.MultiPoint): ArrayBuffer {
        const coordinates = flatGeometry(geometry);

        const view = new DataView(new ArrayBuffer(16 + 8 * coordinates.length));
        view.setFloat64(0, 0, true);
        view.setFloat64(8, 0, true);
        this.setArrayFloat64(view, 16, Array(coordinates.length).fill(0));

        return mergeArrayBuffers([super.onWrite(geometry), view.buffer]);
    }
}