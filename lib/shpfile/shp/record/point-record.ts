/**
 * position       Field           Type          Byte Order          Length
 * 0              Shape Type      Integer       Little Endian       4
 * 4              X               Double        Little Endian       8
 * 12             Y               Double        Little Endian       8
 */

import { ShapeType } from "../../shape-type";
import { ShpRecord } from "./shp-record";

export class PointRecord extends ShpRecord<GeoJSON.Point> {
  protected onRead(view: DataView, byteOffset: number): GeoJSON.Point {
    return {
      type: "Point",
      coordinates: this.readCoordinates(view, byteOffset + 4), // 跳过 ShapeType 4 字节
    };
  }

  protected onWrite(geometry: GeoJSON.Point): ArrayBuffer {
    const view = new DataView(new ArrayBuffer(20));

    view.setInt32(0, ShapeType.Point, true);
    this.writeCoordinates(view, 4, [geometry.coordinates]);

    return view.buffer;
  }
}
