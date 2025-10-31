/**
 * position    Field             Type                       Byte Order          Length
 * 0           Shape Type        Integer                    Little Endian       4
 * 4           Box               Double[4]                  Little Endian       8
 * 36          NumPoints         Integer                    Little Endian       8
 * 40          Points            Double[2 * NumPoints]      Little Endian       8 * 2 * NumPoints
 */

import { bbox, flatGeometry } from "../../../utils";
import { ShapeType } from "../../shape-type";
import { ShpRecord } from "./shp-record";

export class MultiPointRecord extends ShpRecord<GeoJSON.MultiPoint> {
    protected onRead(view: DataView, byteOffset: number): GeoJSON.MultiPoint {
        const bbox = this.readArrayFloat64(view, byteOffset + 4, 4) as GeoJSON.BBox;
        const numPoints = view.getInt32(byteOffset + 36, true);

        return {
            type: 'MultiPoint',
            bbox: bbox,
            coordinates: this.readCoordinates(view, byteOffset + 40, numPoints)
        }
    }

    protected onWrite(geometry: GeoJSON.MultiPoint): ArrayBuffer {
        const coordinates = flatGeometry(geometry);
        const view = new DataView(new ArrayBuffer(20 + 16 * coordinates.length));

        const box = bbox(geometry);
        view.setInt32(0, ShapeType.MultiPoint, true);
        this.setArrayFloat64(view, 4, box);
        view.setInt32(36, coordinates.length, true);
        this.writeCoordinates(view, 40, coordinates);

        return view.buffer;
    }
}