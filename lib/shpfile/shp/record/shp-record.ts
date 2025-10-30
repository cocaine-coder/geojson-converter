export abstract class ShpRecord {
  private geometry: GeoJSON.Geometry | undefined;

  write(view: DataView, byteOffset: number): number {
    if (!this.geometry) {
      console.warn("Geometry is undefined, cannot write ShpRecord.");
      return byteOffset;
    }

    return this.onWrite(view, byteOffset, this.geometry);
  }

  read(view: DataView, byteOffset: number): number {
    const { geometry, nextByteOffset } = this.onRead(view, byteOffset);
    this.geometry = geometry;
    return nextByteOffset;
  }

  protected abstract onRead(
    view: DataView,
    byteOffset: number
  ): {
    geometry: GeoJSON.Geometry;
    nextByteOffset: number;
  };

  protected abstract onWrite(
    view: DataView,
    byteOffset: number,
    geometry: GeoJSON.Geometry
  ): number;
}
