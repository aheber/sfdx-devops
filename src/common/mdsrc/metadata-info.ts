import * as fs from "fs-extra";
import { join } from "path";

export async function getMetadataInfo() {
  const info = JSON.parse(
    fs.readFileSync("./config/metadataTypeInfos.json").toString()
  );
  const customFilesHandlers = {};

  const fileNames = fs.readdirSync(join(__dirname, "typeHandlers"));
  for (let f of fileNames) {
    f = f.replace(/\..+/, "");
    customFilesHandlers[f] = true;
  }
  const infoByDir = {};
  // eslint-disable-next-line guard-for-in
  for (const type in info.typeDefs) {
    if (!info.typeDefs[type].isAddressable) {
      continue;
    }
    // infoByDir[info.typeDefs[type].defaultDirectory] = info.typeDefs[type];
    const dir = info.typeDefs[type].defaultDirectory;
    infoByDir[dir] = info.typeDefs[type];
    // try to load a type-specific handler once, if it fails it will be stamped as "false"
    try {
      // If directory contains, then try and import
      if (customFilesHandlers[dir]) {
        // eslint-disable-next-line no-await-in-loop
        infoByDir[dir].mdtHandler = await import(`./typeHandlers/${dir}`).then(
          (l) => {
            // eslint-disable-next-line new-cap
            return new l.default();
          }
        );
      }
    } catch (error) {
      console.log("Loading Error:", error);
    }
  }
  return infoByDir;
}
