import {SHPFILE} from '../lib';
import fs from 'fs';

const shpfile = fs.readFileSync(`./test/temp/2.zip`);
SHPFILE.readFromZip(shpfile.buffer).then(data=>{
    console.log(data[0].data.features[0]);
});