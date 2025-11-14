import * as fs from 'fs';
import { readShp, writeShp } from '../../lib/shpfile/shp';
import { TCanWriteGeoJSONGeometry } from '../../lib/shpfile/shp/record';


const data = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [120, 30]
            },
            "properties": {
                "name": "名字",
                "身高": 189,
                "测试一下最大中文容量": "测试一下最大中文容量"
            }
        }
    ]
} as GeoJSON.FeatureCollection<TCanWriteGeoJSONGeometry>;

const shpBuffer = writeShp({
    data: data.features
});

const shpFile = fs.readFileSync("../temp/1/POINT.shp");

const { geometries } = readShp({
    file: shpFile
});

console.log(JSON.stringify(geometries));