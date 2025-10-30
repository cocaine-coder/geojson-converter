import { ShapeType } from "../shape-type";
import { PointRecord } from "./record/point-record";
import { ShpRecord } from "./record/shp-record";

export class ShpReader {
  readonly recordsStartByteOffset: number = 100;

  private _fileLength: number = 0;
  private _shapeType: ShapeType = ShapeType.NullShape;

  get fileLength(): number {
    return this._fileLength;
  }

  get shapeType(): ShapeType {
    return this._shapeType;
  }

  read(options: {
    buffer: ArrayBuffer;
    byteOffset?: number;
    byteLength?: number;
  }) {
    const view = new DataView(
      options.buffer,
      options.byteOffset,
      options.byteLength
    );

    this.readHeader(view);
    const records = this.readRecords(view, this.shapeType);
  }

  private readHeader(view: DataView) {
    this._fileLength = view.getInt32(24, false) * 2;
    this._shapeType = view.getInt32(32, true);
  }

  private readRecords(view: DataView, type: ShapeType): Array<ShpRecord> {
    const records: Array<ShpRecord> = [];
    let offset = 100;

    while (offset < this.fileLength) {
      const record: ShpRecord =
        type === ShapeType.Point ? new PointRecord() : new PointRecord();
      offset = record.read(view, offset);
      records.push(record);
    }

    return records;
  }
}
