import { join } from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';
type TypeBaseImportType = typeof import('./typeHandlers/type-diff-base.js');
import type TypeBase from './typeHandlers/type-diff-base.js';

export type TypeDef = {
  metadataName: string;
  isAddressable: boolean;
  isSourceTracked: boolean;
  ext?: string;
  hasContent: boolean;
  defaultDirectory: string;
  nameForMsgs: string;
  nameForMsgsPlural: string;
  contentIsBinary: boolean;
  hasStandardMembers?: boolean;
  deleteSupported: boolean;
  hasVirtualSubtypes?: boolean;
  childXmlNames?: string[];
  parent?: TypeDef;
  inFolder?: boolean;
  folderTypeDef?: TypeDef;
  mdtHandler?: TypeBase;
};

type MetadataInfo = {
  typeDefs: Record<string, TypeDef>;
};

let metadataCache: Record<string, TypeDef>;

export async function getMetadataInfo(): Promise<Record<string, TypeDef>> {
  if (metadataCache) {
    return metadataCache;
  }

  metadataCache = {};
  const info = JSON.parse(readFileSync('./config/metadataTypeInfos.json').toString()) as MetadataInfo;
  const customFilesHandlers: Record<string, boolean> = {};

  const fileNames = readdirSync(join(import.meta.dirname, 'typeHandlers'));
  for (let f of fileNames) {
    f = f.replace(/\..+/, '');
    customFilesHandlers[f] = true;
  }

  for (const type in info.typeDefs) {
    if (!info.typeDefs[type].isAddressable) {
      continue;
    }

    // infoByDir[info.typeDefs[type].defaultDirectory] = info.typeDefs[type];
    const dir = info.typeDefs[type].defaultDirectory;
    metadataCache[dir] = info.typeDefs[type];
    // try to load a type-specific handler once, if it fails it will be stamped as "false"
    try {
      // If directory contains, then try and import
      if (customFilesHandlers[dir]) {
        // eslint-disable-next-line no-await-in-loop
        metadataCache[dir].mdtHandler = await import(`./typeHandlers/${dir}.js`).then(
          (l: TypeBaseImportType) => new l.default()
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Loading Error:', error);
    }
  }

  return metadataCache;
}
