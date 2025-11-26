# [geojson-converter-kit](https://www.npmjs.com/package/geojson-converter-kit)

convert geojson to wkt/kml/shpfile or back

## Install

```bash
npm install geojson-converter-kit

# or use yarn
yarn add geojson-converter-kit

# or use pnpm
pnpm add geojson-converter-kit
```

## Usage

### wkt

```ts
import { WKT } from "geojson-converter-kit";

const wktStr = WKT.stringify({
  type: "Point",
  coordinates: [100.0, 0.0],
});

const geometry = WKT.parse(wktStr);
```
#### stringify - convert geojson to wkt
*args*
| name | type | nullable |
| --- | --- | --- |
| geometry | GeoJSON.Geometry | false |
| includeZ | boolean | true, default false |

#### parse - convert wkt to geojson
*args*
| name | type | nullable |
| --- | --- | --- |
| wkt | string | false |

### kml

```ts
import { KML } from "geojson-converter-kit";

const kmlStr = KML.stringify([
  {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: [100.0, 0.0],
    },
  },
]);

const features = KML.parse(kmlStr);
```
#### stringify - convert geojson to kml
*args*
| name | type | nullable |
| --- | --- | --- |
| data | GeoJSON.FeatureCollection | Array<GeoJSON.Feature> | false | 
| options | KML.Stringify.Options | true, default {} |

*KML.Stringify.Options*
| name | type | nullable |
| --- | --- | --- |
| name | string | true |
| description | string | true |

#### parse - convert kml to geojson
*args*
| name | type | nullable |
| --- | --- | --- |
| kml | string | false |

### shpfile

```ts
import { SHPFILE } from "geojson-converter-kit";

const zipBlob = await SHPFILE.writeToZip([
  {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: [100.0, 0.0],
    },
  },
]);

const featureMaps = await SHPFILE.readFromZip(zipBlob);
```
