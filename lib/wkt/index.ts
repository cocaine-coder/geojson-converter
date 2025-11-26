export namespace WKT {
  export function stringify(geometry: GeoJSON.Geometry, includeZ?: boolean): string {
    let wkt = geometry.type.toUpperCase() + " ";
    if (includeZ) wkt += "Z ";

    switch (geometry.type) {
      case "Point":
        wkt += `(${positionToWKT(geometry.coordinates, includeZ)})`;
        break;
      case "MultiPoint":
      case "LineString":
        wkt += `(${geometry.coordinates
          .map((p) => positionToWKT(p, includeZ))
          .join(", ")})`;
        break;
      case "MultiLineString":
      case "Polygon":
        wkt += `(${geometry.coordinates
          .map(
            (ps) => `(${ps.map((p) => positionToWKT(p, includeZ)).join(", ")})`
          )
          .join(", ")})`;
        break;
      case "MultiPolygon":
        wkt += `(${geometry.coordinates
          .map(
            (pss) =>
              `(${pss
                .map(
                  (ps) =>
                    `(${ps.map((p) => positionToWKT(p, includeZ)).join(", ")})`
                )
                .join(", ")})`
          )
          .join(", ")})`;
        break;
      case "GeometryCollection":
        wkt += `(${geometry.geometries
          .map((g) => stringify(g, includeZ))
          .join(", ")})`;
        break;

      default: throw new Error(`geometry type error: ${geometry}`);
    }

    return wkt;
  }

  export function parse(wkt: string): GeoJSON.Geometry {
    wkt = wkt.trim().toUpperCase();

    if (wkt.startsWith("GEOMETRYCOLLECTION")) {
      wkt = wkt.substring("GEOMETRYCOLLECTION".length, wkt.length - 1).replaceAll("\n", "");
      const ret = { type: "GeometryCollection", geometries: [] } as GeoJSON.GeometryCollection;

      let subWKT = "";
      let typeChar = true;
      for (let i = 0; i < wkt.length; i++) {
        const c = wkt[i];
        if (c >= "A" && c <= "Z") {
          if (subWKT === "" || typeChar) {
            subWKT += c;
          } else {
            ret.geometries.push(parse(subWKT.trim().slice(0, -1)));
            subWKT = c;
          }
          typeChar = true;
        } else {
          subWKT += c;
          typeChar = false;
        }
      }

      return ret;
    } else {
      //匹配括号中的数据(包括括号)
      const temp = wkt.replaceAll("\n", "").match(/\((.+?)\)/g);

      if (wkt.startsWith("POINT")) {
        return {
          type: "Point",
          coordinates: parsePosition(temp![0]),
        };
      } else if (wkt.startsWith("MULTIPOINT") || wkt.startsWith("LINESTRING")) {
        const coordinates = temp![0]
          .split(",")
          .map((item) => parsePosition(item));
        return {
          type: wkt.startsWith("MULTIPOINT") ? "MultiPoint" : "LineString",
          coordinates,
        };
      } else if (wkt.startsWith("MULTILINESTRING") || wkt.startsWith("POLYGON")) {
        const coordinates = temp!.map((v) => v.split(",").map(parsePosition));
        return {
          type: wkt.startsWith("MULTILINESTRING") ? "MultiLineString" : "Polygon",
          coordinates,
        };
      } else if (wkt.startsWith("MULTIPOLYGON")) {
        const ret = { type: "MultiPolygon", coordinates: [] } as GeoJSON.MultiPolygon;
        temp!.forEach(item => {
          if (item.lastIndexOf("(") !== 0) {
            // 新的多边形
            ret.coordinates.push([item.split(",").map(parsePosition)])
          } else {
            // 洞
            ret.coordinates[ret.coordinates.length - 1].push(item.split(",").map(parsePosition))
          }
        });
        return ret;
      }

      throw new Error(`parse error: ${wkt}`);
    }
  }
}

function positionToWKT(position: GeoJSON.Position, includeZ?: boolean): string {
  const x = position[0] ?? 0;
  const y = position[1] ?? 0;
  const z = position[2] ?? 0;

  const arr = [x, y];
  if (includeZ) {
    arr.push(z);
  }
  return arr.join(" ");
}

function parsePosition(str: string): GeoJSON.Position {
  return str.trim().replace(/\(|\)/g, "").split(" ").filter(x => x !== "").map(parseFloat);
}