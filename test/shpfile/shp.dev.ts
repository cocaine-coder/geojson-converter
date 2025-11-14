import * as fs from 'fs';
import { readShp } from '../../lib/shpfile/shp';

const file = fs.readFileSync("../mock/shp/点/点.shp");
const { geometries } = readShp({
    file
});

console.log(JSON.stringify(geometries));