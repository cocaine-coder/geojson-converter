import { bbox, mergeArrayBuffers } from "../../utils";
import { ShapeType } from "../shape-type";
import { createReadRecord, createWriteRecord, TCanWriteGeoJSONGeometry } from "./record";

export function readShp(options: {
  buffer: ArrayBuffer;
  byteOffset?: number;
  byteLength?: number;
}) {
  const view = new DataView(
    options.buffer,
    options.byteOffset,
    options.byteLength
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

  return mergeArrayBuffers([headerView.buffer, ...recordArrayBuffers]);
}