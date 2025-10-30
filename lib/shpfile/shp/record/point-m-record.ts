/**
 * position       Field           Type          Byte Order          Length
 * 0              Shape Type      Integer       Little Endian       4
 * 4              X               Double        Little Endian       8
 * 12             Y               Double        Little Endian       8
 * 20             M               Double        Little Endian       8
 */

import { PointRecord } from "./point-record";

export class PointMRecord extends PointRecord{

}