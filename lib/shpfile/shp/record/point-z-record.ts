/**
 * position       Field           Type          Byte Order          Length
 * 0              Shape Type      Integer       Little Endian       4
 * 4              X               Double        Little Endian       8
 * 12             Y               Double        Little Endian       8
 * 20             Z               Double        Little Endian       8
 * 28             M               Double        Little Endian       8
 */

import { mergeArrayBuffers } from "../../../utils";
import { PointRecord } from "./point-record";

export class PointZRecord extends PointRecord {
    protected onRead(view: DataView, byteOffset: number): GeoJSON.Point {
        const point = super.onRead(view, byteOffset);

        const z = view.getFloat64(byteOffset + 20, true);
        point.coordinates[2] = z;
        return point;
    }

    protected onWrite(geometry: GeoJSON.Point): ArrayBuffer {
        const view = new DataView(new ArrayBuffer(16));
        const z = geometry.coordinates[2];
        view.setFloat64(4, z ?? 0, true);
        view.setFloat64(4, 0, true);

        return mergeArrayBuffers([super.onWrite(geometry), view.buffer]);
    }
}