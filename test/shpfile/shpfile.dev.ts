import { SHPFILE } from '../../lib';
import fs from 'fs';

(async () => {
    const geojson = JSON.parse(fs.readFileSync('../mock/1.geojson', { encoding: "utf-8" }));
    const blob = await SHPFILE.writeToZip({ data: geojson });
    const arrayBuffer = await blob.arrayBuffer();
    fs.writeFileSync("../temp/1.zip", new Uint8Array(arrayBuffer), {});

    const data =await SHPFILE.readFromZip(blob);
    console.log(JSON.stringify(data));
})();



