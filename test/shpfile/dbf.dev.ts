import * as fs from 'fs';
import { readDbf } from '../../lib/shpfile/dbf';

const file = fs.readFileSync("../mock/shp/点/点.dbf");
const records = readDbf({file});

console.log(records);