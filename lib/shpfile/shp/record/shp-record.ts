import { mergeArrayBuffers } from "../../../utils";

export abstract class ShpRecord<TGeometry extends GeoJSON.Geometry = GeoJSON.Geometry> {
  private _num: number | undefined;
  private _geometry: TGeometry | undefined;

  get num(): number | undefined {
    return this._num;
  }

  get geometry(): TGeometry | undefined {
    return this._geometry;
  }

  write(options: { num: number, geometry: TGeometry } | ShpRecord<TGeometry>): ArrayBuffer {
    if (!options.geometry || options.num === undefined) {
      throw new Error("num or geometry is undefined");
    }

    if (options.geometry.type === "GeometryCollection") {
      throw new Error("GeometryCollection is not supported");
    }

    this._num = options.num;
    this._geometry = options.geometry;

    const headerArrayBuffer = new ArrayBuffer(8);
    const headerView = new DataView(headerArrayBuffer);
    headerView.setInt32(0, options.num, false);
    const geometryArrayBuffer = this.onWrite(options.geometry);
    headerView.setInt32(4, geometryArrayBuffer.byteLength / 2, false);

    return mergeArrayBuffers([headerArrayBuffer, geometryArrayBuffer]);
  }

  read(view: DataView, byteOffset: number): { geometry: TGeometry, recordLength: number } {
    // 读取记录头部 8 字节
    this._num = view.getInt32(byteOffset, false);
    const contentLength = view.getInt32(byteOffset + 4, false) * 2;

    // 读取记录内容
    this._geometry = this.onRead(view, byteOffset + 8);

    // 返回下一个记录的起始偏移
    return { geometry: this._geometry, recordLength: 8 + contentLength };
  }

  protected abstract onRead(
    view: DataView,
    byteOffset: number
  ): TGeometry;

  protected abstract onWrite(
    geometry: TGeometry
  ): ArrayBuffer;

  protected readCoordinates(view: DataView, byteOffset: number): GeoJSON.Position;
  protected readCoordinates(view: DataView, byteOffset: number, numPoints: number): GeoJSON.Position[];
  protected readCoordinates(
    view: DataView,
    byteOffset: number,
    numPoints?: number
  ): GeoJSON.Position | GeoJSON.Position[] {

    if (numPoints !== undefined) {
      return Array.from({ length: numPoints }, (_, i) => this.readCoordinates(view, byteOffset + 16 * i));
    }

    const x = view.getFloat64(byteOffset, true);
    const y = view.getFloat64(byteOffset + 8, true);

    return [x, y];
  }

  protected writeCoordinates(view: DataView, byteOffset: number, coordinates: GeoJSON.Position[]) {
    coordinates.forEach((coordinate, i) => {
      view.setFloat64(byteOffset + 16 * i, coordinate[0], true);
      view.setFloat64(byteOffset + 16 * i + 8, coordinate[1], true);
    });
  }

  protected readArrayInt32(view: DataView, byteOffset: number, length: number, littleEndian: boolean = true): number[] {
    return Array.from({ length }, (_, i) => view.getInt32(byteOffset + i * 4, littleEndian));
  }

  protected readArrayFloat64(view: DataView, byteOffset: number, length: number, littleEndian: boolean = true): number[] {
    return Array.from({ length }, (_, i) => view.getFloat64(byteOffset + i * 8, littleEndian));
  }

  protected setArrayInt32(view: DataView, byteOffset: number, array: number[], littleEndian: boolean = true) {
    array.forEach((value, i) => view.setInt32(byteOffset + i * 4, value, littleEndian));
  }

  protected setArrayFloat64(view: DataView, byteOffset: number, array: number[], littleEndian: boolean = true) {
    array.forEach((value, i) => view.setFloat64(byteOffset + i * 8, value, littleEndian));
  }
}
