import {KML} from '../../lib';

const result = KML.stringify({
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
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [120, 30],
          [120, 31]
        ]
      },
      "properties": {
        "name": "名字",
        "身高": 189,
        "测试一下最大中文容量": "测试一下最大中文容量"
      }
    }
  ]
});

console.log(result);

const features = KML.parse(`
    <?xml version="1.0" encoding="UTF-8"?>
    ${result}
    `);

console.log(JSON.stringify(features, null, 2));