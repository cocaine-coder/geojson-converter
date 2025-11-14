import * as fs from 'fs';
import { readDbf } from '../../lib/shpfile/dbf';

import iconv from 'iconv-lite';

const file = fs.readFileSync("../mock/shp/点/点.dbf");

const props = readDbf({
    file
});

console.log(props);
