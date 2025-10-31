/**
 * position       Field           Type          Byte Order          Length
 * 0              Shape Type      Integer       Little Endian       4
 * 4              X               Double        Little Endian       8
 * 12             Y               Double        Little Endian       8
 * 20             M               Double        Little Endian       8
 */

import { mergeArrayBuffers } from "../../../utils";
import { PointRecord } from "./point-record";

export class PointMRecord extends PointRecord{

    protected onWrite(geometry: GeoJSON.Point): ArrayBuffer {
        const view = new DataView(new ArrayBuffer(8));
        view.setFloat64(0, 0, true);
        
        return mergeArrayBuffers([super.onWrite(geometry), view.buffer]);
    }
}