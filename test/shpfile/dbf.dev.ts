import * as fs from 'fs';
import { readDbf } from '../../lib/shpfile/dbf';

import iconv from 'iconv-lite';

const file = fs.readFileSync("../temp/1/POINT.dbf");

const props = readDbf({
    file
});

console.log(props);
