import * as fs from 'fs';
import {ShpReader} from '../lib/shpfile/shp/reader';

const file = fs.readFileSync("./mock/shp/点/点.shp");


const shpReader = new ShpReader();

shpReader.read(file);

console.log("file length: " + shpReader.fileLength);
console.log("shape type : " + shpReader.shapeType.toString());


