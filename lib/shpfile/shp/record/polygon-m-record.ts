/**
 *  position             Field Name     Type                     Byte Order        Length
 *  0                    Shape Type     Integer                  Little Endian     4
 *  4                    Box            Double[4]                Little Endian     8 * 4
 *  36                   NumParts       Double                   Little Endian     4
 *  40                   NumPoints      Double                   Little Endian     4
 *  44                   Parts          Integer[NumParts]        Little Endian     4 * NumParts
 *  X                    Points         Double[2 * NumPoints]    Little Endian     8 * 2 * NumPoints
 *  Y                    Mmin           Double                   Little Endian     8
 *  Y + 8                Mmax           Double                   Little Endian     8
 *  Y + 16               Marray         Double[NumPoints]        Little Endian     8 * NumPoints        
 * 
 *  X = 44 + 4 * NumParts
 *  Y = X + 2 * 8 * NumPoints
 */

import { PolygonRecord } from "./polygon-record";

export class PolygonMRecord extends PolygonRecord{

}