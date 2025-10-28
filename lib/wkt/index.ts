export function toWKT(geometry: GeoJSON.Geometry, includeZ: boolean): string {
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
        .map((g) => toWKT(g, includeZ))
        .join(", ")})`;
      break;
  }

  return wkt;
}

function positionToWKT(position: GeoJSON.Position, includeZ: boolean): string {
  const x = position[0] ?? 0;
  const y = position[1] ?? 0;
  const z = position[2] ?? 0;

  const arr = [x, y];
  if (includeZ) {
    arr.push(z);
  }
  return arr.join(" ");
}

export function fromWKT(wkt: string): GeoJSON.Geometry {
  wkt = wkt.trim();

  if (wkt.startsWith("GEOMETRYCOLLECTION")) {
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
    }
  }
}

function parsePosition(str: string): GeoJSON.Position {
  return str.trim().replace(/\(|\)/g, "").split(" ").map(parseFloat);
}
