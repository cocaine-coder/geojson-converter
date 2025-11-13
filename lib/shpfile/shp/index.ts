import { bbox, mergeArrayBuffers, TFileLike } from "../../utils";
import { ShapeType } from "../shape-type";
import { createReadRecord, createWriteRecord, TCanWriteGeoJSONGeometry } from "./record";

export function readShp(options: {
  file: TFileLike
}) {
  const view = new DataView(
    options.file.buffer,
    options.file.byteOffset,
    options.file.byteLength
  );

  const fileLength = view.getInt32(24, false) * 2;
  const shapeType = view.getInt32(32, true);

  const geometries = new Array<GeoJSON.Geometry>();
  let offset = 100;

  while (offset < fileLength) {
    const record = createReadRecord(shapeType);
    const { geometry, recordLength } = record.read(view, offset);

    geometries.push(geometry);
    offset += recordLength;
  }

  return { geometries, shapeType };
}

export function writeShp(options: {
  data: Array<TCanWriteGeoJSONGeometry> | Array<GeoJSON.Feature<TCanWriteGeoJSONGeometry>> | GeoJSON.FeatureCollection<TCanWriteGeoJSONGeometry>
}) {
  if (!(options.data instanceof Array)) {
    options.data = options.data.features;
  }

  let shapeType: ShapeType = ShapeType.NullShape;
  const recordArrayBuffers = options.data.map((item, index) => {
    if (item.type === 'Feature') {
      item = item.geometry;
    }

    const [record, type] = createWriteRecord(item.type);

    if (shapeType !== ShapeType.NullShape && shapeType !== type)
      throw new Error(`Shape type ${type} does not match previous shape type ${shapeType}`);

    shapeType = type;

    return record.write({
      num: index + 1,
      geometry: item
    });
  });

  const headerView = new DataView(new ArrayBuffer(100));
  headerView.setInt32(0, 9994, false);
  headerView.setInt32(24, 100 + recordArrayBuffers.reduce((sum, buffer) => sum + buffer.byteLength, 0), false);
  headerView.setInt32(28, 1000, true);
  headerView.setInt32(32, shapeType, true);

  const box = bbox(options.data, true);
  headerView.setFloat64(36, box[0], true);
  headerView.setFloat64(44, box[1], true);
  headerView.setFloat64(52, box[2], true);
  headerView.setFloat64(60, box[3], true);
  headerView.setFloat64(68, box[4], true);
  headerView.setFloat64(76, box[5], true);
  headerView.setFloat64(84, 0, true);
  headerView.setFloat64(92, 0, true);

  const shx = writeShx(shapeType, box, 100, recordArrayBuffers);

  return { shx, shp: mergeArrayBuffers([headerView.buffer, ...recordArrayBuffers]) };
}

function writeShx(shapeType: ShapeType, bbox: Array<number>, offset: number, recordArrayBuffers: Array<ArrayBuffer>): ArrayBuffer {
  const shxFileLenght = 100 + 8 * recordArrayBuffers.length;
  const view = new DataView(new ArrayBuffer(shxFileLenght));

  view.setInt32(0, 0x0000270a, false);
  view.setInt32(24, shxFileLenght, false);
  view.setInt32(28, 1000, true);
  view.setInt32(32, shapeType, true);
  view.setFloat64(36, bbox[0], true);
  view.setFloat64(44, bbox[1], true);
  view.setFloat64(52, bbox[2], true);
  view.setFloat64(60, bbox[3], true);

  recordArrayBuffers.forEach((buffer, index) => {
    const lastBuffer = recordArrayBuffers[index - 1];
    offset += lastBuffer?.byteLength || 0;

    view.setInt32(100 + index * 8, offset, false);
    view.setInt32(100 + index * 8 + 4, buffer.byteLength, false);
  });

  return view.buffer;
}