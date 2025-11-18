import {proj4ToWkt} from '../lib/utils';

console.log(proj4ToWkt("+proj=longlat +datum=WGS84 +no_defs"));
console.log(proj4ToWkt("+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=37.5 +lon_0=-96 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs"));