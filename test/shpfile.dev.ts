import {SHPFILE} from '../lib';
import fs from 'fs';

const shpfile = fs.readFileSync("./temp/乔林111.zip");
SHPFILE.readFromZip(shpfile.buffer).then(data=>{
    console.log(data[0].data.features[0]);
});