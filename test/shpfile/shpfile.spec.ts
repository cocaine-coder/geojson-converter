import { SHPFILE } from '../../lib';
import fs from 'fs';


const zipFile = fs.readFileSync('../mock/shp/点.zip');

const geojson = await SHPFILE.readFromZip(zipFile.buffer);

console.log(JSON.stringify(geojson, null, 2));