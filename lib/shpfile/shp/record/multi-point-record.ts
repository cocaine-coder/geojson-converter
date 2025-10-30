/**
 * position    Field             Type                       Byte Order          Length
 * 0           Shape Type        Integer                    Little Endian       4
 * 4           Box               Double[4]                  Little Endian       8
 * 36          NumPoints         Integer                    Little Endian       8
 * 40          Points            Double[2 * NumPoints]      Little Endian       8 * 2 * NumPoints
 */

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

    protected onWrite(view: DataView, byteOffset: number, geometry: GeoJSON.MultiPoint): void {
        
    }
}