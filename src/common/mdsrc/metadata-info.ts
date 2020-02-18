import * as fs from "fs-extra";

export async function getMetadataInfo() {
  const info = JSON.parse(
    fs.readFileSync("./config/metadataTypeInfos.json").toString()
  );
  const infoByDir = {};
  // eslint-disable-next-line guard-for-in
  for (const type in info.typeDefs) {
    // infoByDir[info.typeDefs[type].defaultDirectory] = info.typeDefs[type];
    const dir = info.typeDefs[type].defaultDirectory;
    infoByDir[dir] = info.typeDefs[type];
    // try to load a type-specific handler once, if it fails it will be stamped as "false"
    try {
      // eslint-disable-next-line no-await-in-loop
      infoByDir[dir].mdtHandler = await import(`./typeHandlers/${dir}`).then(
        l => {
          // eslint-disable-next-line new-cap
          return new l.default();
        }
      );
    } catch (error) {
      // perTypeHandlers[info.typeDefs[type].defaultDirectory] = false;
    }
  }
  return infoByDir;
}
