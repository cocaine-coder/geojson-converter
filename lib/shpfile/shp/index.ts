import { shapetype_record_read_map, ShpRecord } from "./record";

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

  if (!shapetype_record_read_map.has(shapeType)) {
    throw new Error(`Unsupported ShapeType: ${shapeType}`);
  }

  const recordCreateFunc = shapetype_record_read_map.get(shapeType)!;
  const records = new Array<ShpRecord>();
  let offset = 100;

  while (offset < fileLength) {
    const record: ShpRecord = recordCreateFunc();
    offset = record.read(view, offset);
    records.push(record);
  }

  return { records, shapeType };
}