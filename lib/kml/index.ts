import { IDocument, IFolder, IPlacemark } from "./schema";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { toGeometry, toPlacemark } from "./utils";

export namespace KML {
    export function stringify(data: GeoJSON.FeatureCollection | Array<GeoJSON.Feature>, options: {
        name?: string;
        description?: string;
    } = {}): string {
        data = data instanceof Array ? data : data.features;
        const xmlDoc: IDocument = {
            name: options.name || "",
            description: options.description || "",
        }

        xmlDoc.Placemark = data.map<IPlacemark>(x => toPlacemark(x.geometry));

        return `<?xml version="1.0" encoding="UTF-8"?>\n` +
            new XMLBuilder({
                attributeNamePrefix: "$",
                ignoreAttributes: false,
                cdataPropName: "__cdata"
            }).build({
                kml: {
                    $xmlns: "http://www.opengis.net/kml/2.2",
                    "$xmlns:gx": "http://www.google.com/kml/ext/2.2",
                    Document: xmlDoc
                }
            });
    }

    export function parse(kml: string): Array<GeoJSON.Feature> {
        const doc: IDocument = new XMLParser({
            attributeNamePrefix: "$",
            ignoreAttributes: false,
            cdataPropName: "__cdata"
        }).parse(kml).kml.Document;

        const result: Array<GeoJSON.Feature> = [];

        const pushToResult = (p: IPlacemark) => {
            const g = toGeometry(p);
            if (!g) return;

            result.push({
                type: "Feature",
                geometry: g,
                properties: {}
            });
        }

        const fillInFolder = (folder: IFolder) => {
            if (folder.Placemark) {
                if (folder.Placemark instanceof Array) {
                    folder.Placemark.forEach(pushToResult)
                }
                else {
                    pushToResult(folder.Placemark);
                }
            }

            if (folder.Folder) {
                if (folder.Folder instanceof Array)
                    folder.Folder.forEach(fillInFolder)
                else
                    fillInFolder(folder.Folder)
            }
        }

        if (doc.Folder) {
            if (doc.Folder instanceof Array)
                doc.Folder.forEach(fillInFolder);
            else
                fillInFolder(doc.Folder);
        }

        if (doc.Placemark) {
            if (doc.Placemark instanceof Array)
                doc.Placemark.forEach(pushToResult)
            else
                pushToResult(doc.Placemark);
        }

        return result;
    }
}