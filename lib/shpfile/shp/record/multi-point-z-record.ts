/**
 * position    Field             Type                       Byte Order          Length
 * 0           Shape Type        Integer                    Little Endian       4
 * 4           Box               Double[4]                  Little Endian       8
 * 36          NumPoints         Integer                    Little Endian       8
 * 40          Points            Double[2 * NumPoints]      Little Endian       8 * 2 * NumPoints
 * X           Zmin              Double                     Little Endian       8
 * X + 8       Zmax              Double                     Little Endian       8
 * X + 16      Zarray            Double[NumPoints]          Little Endian       8 * NumPoints
 * Y           Mmin              Double                     Little Endian       8
 * Y + 8       Mmax              Double                     Little Endian       8
 * Y + 16      Marray            Double[NumPoints]          Little Endian       8 * NumPoints
 * 
 * X = 40 + (2 * 8 * NumPoints)
 * Y = X + 16 + 8 * NumPoints
 */

import { MultiPointRecord } from "./multi-point-record";

export class MultiPointZRecord extends MultiPointRecord {
    protected onRead(view: DataView, byteOffset: number): GeoJSON.MultiPoint {
        const multiPoint = super.onRead(view, byteOffset);
        const numPoints = multiPoint.coordinates.length;

        const zs = this.readArrayFloat64(view, 40 + (2 * 8 * numPoints) + 16, numPoints);

        multiPoint.coordinates.forEach((coord, i) => {
            coord[2] = zs[i];
        });

        return multiPoint;
    }
}