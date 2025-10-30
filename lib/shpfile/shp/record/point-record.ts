import { ShpRecord } from "./shp-record";

export class PointRecord extends ShpRecord {
  protected onRead(
    view: DataView,
    byteOffset: number
  ): { geometry: GeoJSON.Geometry; nextByteOffset: number } {
    /* 结构
     * 4 bytes - Record Number     Integer   Big Endian
     * 4 bytes - Content Length    Integer   Big Endian
     * 4 bytes - Shape Type        Integer   Little Endian
     * 8 bytes - X                 Double    Little Endian
     * 8 bytes - Y                 Double    Little Endian
     */

    // 这里只读取 X,Y 坐标
    const x = view.getFloat64(byteOffset + 12, true);
    const y = view.getFloat64(byteOffset + 20, true);

    return {
      geometry: {
        type: "Point",
        coordinates: [x, y],
      },
      nextByteOffset: byteOffset + 28,
    };
  }

  protected onWrite(
    view: DataView,
    byteOffset: number,
    geometry: GeoJSON.Geometry
  ): number {

    return byteOffset;
  }
}
