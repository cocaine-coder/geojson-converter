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

import { MultiPointRecord } from "./multi-point-record";

export class MultiPointMRecord extends MultiPointRecord{

}