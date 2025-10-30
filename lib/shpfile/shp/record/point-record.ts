/**
 * position       Field           Type          Byte Order          Length
 * 0              Shape Type      Integer       Little Endian       4
 * 4              X               Double        Little Endian       8
 * 12             Y               Double        Little Endian       8
 */

import { ShpRecord } from "./shp-record";

export class PointRecord extends ShpRecord<GeoJSON.Point> {
  protected onRead(view: DataView, byteOffset: number): GeoJSON.Point {
    return {
      type: "Point",
      coordinates: this.readCoordinates(view, byteOffset + 4), // 跳过 ShapeType 4 字节
    };
  }

  protected onWrite(
    view: DataView,
    byteOffset: number,
    geometry: GeoJSON.Point
  ): void {
  }
}
