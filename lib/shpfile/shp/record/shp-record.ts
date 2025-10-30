export abstract class ShpRecord<TGeometry extends GeoJSON.Geometry = GeoJSON.Geometry> {
  private _geometry: TGeometry | undefined;
  private _recordNumber: number | undefined;

  get recordNumber(): number | undefined {
    return this._recordNumber;
  }

  get geometry(): TGeometry | undefined {
    return this._geometry;
  }

  constructor(num?: number, geometry?: TGeometry) {
    this._recordNumber = num;
    this._geometry = geometry;
  }

  write(view: DataView, byteOffset: number): number {
    if (!this.geometry) {
      console.warn("Geometry is undefined, cannot write ShpRecord.");
      return byteOffset;
    }

    return this.onWrite(view, byteOffset, this.geometry);
  }

  read(view: DataView, byteOffset: number): number {
    // 读取记录头部 8 字节
    this._recordNumber = view.getInt32(byteOffset, false);
    const contentLength = view.getInt32(byteOffset + 4, false) * 2;

    // 读取记录内容
    this._geometry = this.onRead(view, byteOffset + 8);

    // 返回下一个记录的起始偏移
    return byteOffset + 8 + contentLength;
  }

  protected abstract onRead(
    view: DataView,
    byteOffset: number
  ): TGeometry;

  protected abstract onWrite(
    view: DataView,
    byteOffset: number,
    geometry: TGeometry
  ): number;

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

  protected readArrayInt32(view: DataView, byteOffset: number, length: number): number[] {
    return Array.from({ length }, (_, i) => view.getInt32(byteOffset + i * 4, true));
  }

  protected readArrayFloat64(view: DataView, byteOffset: number, length: number): number[] {
    return Array.from({ length }, (_, i) => view.getFloat64(byteOffset + i * 8, true));
  }
}
