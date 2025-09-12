/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import * as path from 'node:path';
import { format } from 'node:util';
import { writeFile, copyFile, mkdir, readFile } from 'node:fs/promises';
import * as dircompare from 'dir-compare';
import { Builder } from 'xml2js';

import { compareAsync } from './compare-async-handler.js';
import { getMetadataInfo } from './metadata-info.js';
import type { TypeDef } from './metadata-info.js';

const bundleTypes = new Set(['AuraDefinitionBundle', 'LightningComponentBundle', 'ExperienceBundle']);
const explodedTypes: Record<string, string> = { ExperienceBundle: 'site' };
const fullPathTypes = new Set(['EmailTemplate', 'Document', 'Dashboard', 'Report']);
let metadataInfo: Awaited<ReturnType<typeof getMetadataInfo>>;

type PackageType = {
  members: string[];
  name: string[];
};

type PackageXml = {
  Package: {
    $: {
      xmlns: string;
    };
    version: string[];
    types: PackageType[];
  };
};

function addToPackage(packageXml: PackageXml, type: string, member: string): void {
  let packageType = packageXml.Package.types.find((p) => p.name[0] === type);
  if (!packageType) {
    packageType = {
      members: [],
      name: [type],
    };
    packageXml.Package.types.push(packageType);
  }

  if (!packageType.members.includes(member)) {
    packageType.members.push(member);
  }
}

// eslint-disable-next-line max-params
async function buildOutput(
  fileDiffs: Record<string, string[]>,
  outputPath: string,
  path1: string,
  path2: string,
  packageXML: PackageXml
): Promise<void> {
  // eslint-disable-next-line guard-for-in
  for (const key in fileDiffs) {
    const metadataType = metadataInfo[key];

    await mkdir(outputPath + '/' + key, { recursive: true });
    for (let fileName of fileDiffs[key]) {
      const [content1, content2] = await Promise.all([
        readFile(path1 + '/' + key + '/' + fileName, 'utf8'),
        readFile(path2 + '/' + key + '/' + fileName, 'utf8'),
      ]);

      addToPackage(
        packageXML,
        metadataType.metadataName,
        fileName.replace(new RegExp(`.${metadataType.ext ?? ''}$`), '')
      );

      if (metadataType.mdtHandler?.addToPackageXml) {
        const newMembers = await metadataType.mdtHandler.addToPackageXml(path1 + '/' + key + '/' + fileName, content1);
        // eslint-disable-next-line guard-for-in
        for (const type in newMembers) {
          // eslint-disable-next-line max-depth
          for (const member of newMembers[type]) {
            addToPackage(packageXML, type, member);
          }
        }
      }

      if (metadataType.mdtHandler?.addFiles) {
        const extraFiles = await metadataType.mdtHandler.addFiles(path1 + '/' + key + '/' + fileName, content1);
        for (const file of extraFiles) {
          // probably need to find the right path
          await mkdir(path.dirname(outputPath + '/' + file.path), { recursive: true });
          await writeFile(outputPath + '/' + file.path, file.content);
        }
      }

      if (metadataType.mdtHandler?.buildOutput) {
        // if filename only exists in src then copy holesale?
        // if both exist then
        try {
          const customOutput = await metadataType.mdtHandler.buildOutput(content1, content2);

          await writeFile(outputPath + '/' + key + '/' + fileName, customOutput);
          continue;
        } catch {
          // will just copy the source to the org
        }
      }

      try {
        await copyFile(path1 + '/' + key + '/' + fileName, outputPath + '/' + key + '/' + fileName);
      } catch (error) {
        console.log('Error copy 1', error);
      }

      if (
        metadataType.hasContent &&
        (explodedTypes[metadataType.metadataName] || !bundleTypes.has(metadataType.metadataName))
      ) {
        // console.log("\t", fileName + "-meta.xml");
        if (explodedTypes[metadataType.metadataName]) {
          // get the related xml if we're pushing the entire directory
          fileName = fileName + '.' + explodedTypes[metadataType.metadataName];
        }

        try {
          await copyFile(
            path1 + '/' + key + '/' + fileName + '-meta.xml',
            outputPath + '/' + key + '/' + fileName + '-meta.xml'
          );
        } catch (error) {
          console.log('Error copy 2', error);
        }
      }
    }
  }
}

// eslint-disable-next-line max-params
function processEqualState(
  entry: dircompare.Difference,
  name: string,
  metadataType: TypeDef,
  pathParts: string[],
  toDelete: Record<string, string[]>,
  metadataTypeDir: string,
  fileDiffs: Record<string, string[]>
): void {
  let compName = name;
  if (
    entry.type1 === 'missing' &&
    // Only pass it through if it is not a bundle or is the xml file in the bundle
    (!bundleTypes.has(metadataType.metadataName) || compName.includes('-meta.xml'))
  ) {
    if (bundleTypes.has(metadataType.metadataName)) {
      compName = pathParts[0];
    }

    //  Make sure the component is registered for deletion
    if (toDelete[metadataTypeDir] === undefined) {
      // eslint-disable-next-line no-param-reassign
      toDelete[metadataTypeDir] = [];
    }

    if (!toDelete[metadataTypeDir].includes(format('%s', compName))) {
      toDelete[metadataTypeDir].push(format('%s', compName));
    }

    // if this metadata entity is already registered, remove it
    if (fileDiffs[metadataTypeDir] !== undefined && fileDiffs[metadataTypeDir].includes(format('%s', compName))) {
      fileDiffs[metadataTypeDir].splice(fileDiffs[metadataTypeDir].indexOf(format('%s', compName)), 1);
    }
  }

  if (fileDiffs[metadataTypeDir] === undefined) {
    // eslint-disable-next-line no-param-reassign
    fileDiffs[metadataTypeDir] = [];
  }

  // handle bundles of metadata (aura, lwc, etc)
  if (bundleTypes.has(metadataType.metadataName)) {
    if (toDelete[metadataTypeDir] !== undefined && toDelete[metadataTypeDir].includes(format('%s', pathParts[0]))) {
      // This component has been marked for deletion, do not add to changed components
      return;
    }

    // If the file is part of a bundle but is a surface level file, just drop the file type
    compName = pathParts[0] ? pathParts[0] : compName.replace(/\..*/, '');
  }

  if (fullPathTypes.has(metadataType.metadataName)) {
    pathParts.push(compName);
    compName = pathParts.join('/');
  }

  if (metadataType.hasContent) {
    // normalize the content name so we can handle bringing both components later
    compName = compName.replace('-meta.xml', '');
  }

  // de-dupe metadata references
  if (!fileDiffs[metadataTypeDir].includes(format('%s', compName))) {
    fileDiffs[metadataTypeDir].push(format('%s', compName));
  }
}

export default async function doIt({
  apiVersion,
  blockedTypes,
  outputPath,
  path1,
  path2,
}: {
  apiVersion: string;
  blockedTypes: string[];
  outputPath: string;
  path1: string;
  path2: string;
}): Promise<void> {
  metadataInfo = await getMetadataInfo();
  const packageXML: PackageXml = {
    Package: {
      $: {
        xmlns: 'http://soap.sforce.com/2006/04/metadata',
      },
      types: [],
      version: [],
    },
  };
  packageXML.Package.version.push(apiVersion);

  const options: dircompare.Options = {
    compareContent: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    compareFileAsync: compareAsync as any,
    excludeFilter: 'package.xml',
    ignoreLineEnding: true,
    ignoreWhiteSpaces: true,
    metadataInfo,
    paths: [path1, path2],
  };

  const res = await dircompare.compare(path1, path2, options);
  const toDelete = {};
  const fileDiffs: Record<string, string[]> = {};
  if (res.diffSet === undefined) {
    throw new Error('Compare returned undefined');
  }
  for (const entry of res.diffSet) {
    // Exists in target org but not in source
    // Will not correctly report missing fields in this format
    if (entry.type2 === 'directory' || entry.type1 === 'directory') {
      continue;
    }

    const name = entry.name1 ?? entry.name2;
    if (name === undefined) {
      throw new Error('Unable to determine entry name:' + JSON.stringify(entry));
    }
    const pathParts = entry.relativePath.split(/[/\\]/);

    // dump the leading /
    pathParts.shift();
    const metadataTypeDir = pathParts.shift();
    if (metadataTypeDir === undefined) {
      throw new Error('entry.relativePath did not contain a directory: ' + entry.relativePath);
    }
    const metadataType = metadataInfo[metadataTypeDir];

    if (metadataType === undefined) {
      continue;
    }

    if (blockedTypes.includes(metadataType.metadataName)) {
      continue;
    }

    if (entry.state !== 'equal') {
      processEqualState(entry, name, metadataType, pathParts, toDelete, metadataTypeDir, fileDiffs);
    }
  }

  await mkdir(outputPath, { recursive: true });
  // process discovered changed files
  await buildOutput(fileDiffs, outputPath, path1, path2, packageXML);

  // build package.xml
  const builder = new Builder({
    xmldec: { encoding: 'UTF-8', version: '1.0' },
  });
  const xml = builder.buildObject(packageXML);
  await writeFile(outputPath + '/package.xml', xml);
  try {
    await copyFile(path1 + '/destructiveChangesPost.xml', outputPath + '/destructiveChangesPost.xml');
  } catch {
    // console.log("Error copying desctructiveChangesPost.xml,", err);
  }
}
