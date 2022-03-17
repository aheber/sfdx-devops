/* eslint-disable no-await-in-loop */
import * as dircompare from "dir-compare";
import * as fs from "fs-extra";
import * as path from "path";
import { format } from "util";
import { Builder } from "xml2js";
import { compareAsync } from "./compare-async-handler";
import { getMetadataInfo } from "./metadata-info";

const bundleTypes = [
  "AuraDefinitionBundle",
  "LightningComponentBundle",
  "ExperienceBundle",
];
const explodedTypes = { ExperienceBundle: "site" };
const fullPathTypes = ["EmailTemplate", "Document", "Dashboard", "Report"];
let metadataInfo;

function addToPackage(packageXml, type, member) {
  let packageType = packageXml.Package.types.find((p) => p.name[0] === type);
  if (!packageType) {
    packageType = {
      name: [type],
      members: [],
    };
    packageXml.Package.types.push(packageType);
  }
  if (!packageType.members.includes(member)) {
    packageType.members.push(member);
  }
}

// eslint-disable-next-line max-params
async function buildOutput(fileDiffs, outputPath, path1, path2, packageXML) {
  // eslint-disable-next-line guard-for-in
  for (const key in fileDiffs) {
    const metadataType = metadataInfo[key];

    await fs.ensureDir(outputPath + "/" + key);
    for (let fileName of fileDiffs[key]) {
      addToPackage(
        packageXML,
        metadataType.metadataName,
        fileName.replace(new RegExp(`.${metadataType.ext}$`), "")
      );

      if (metadataType.mdtHandler && metadataType.mdtHandler.addToPackageXml) {
        const newMembers = await metadataType.mdtHandler.addToPackageXml(
          path1 + "/" + key + "/" + fileName
        );
        // eslint-disable-next-line guard-for-in
        for (const type in newMembers) {
          // eslint-disable-next-line max-depth
          for (const member of newMembers[type]) {
            addToPackage(packageXML, type, member);
          }
        }
      }

      if (metadataType.mdtHandler && metadataType.mdtHandler.addFiles) {
        const extraFiles = await metadataType.mdtHandler.addFiles(
          path1 + "/" + key + "/" + fileName
        );
        for (const file of extraFiles) {
          // probably need to find the right path
          await fs.ensureDir(path.dirname(outputPath + "/" + file.path));
          await fs.writeFile(outputPath + "/" + file.path, file.content);
        }
      }
      if (metadataType.mdtHandler && metadataType.mdtHandler.buildOutput) {
        // if filename only exists in src then copy holesale?
        // if both exist then
        try {
          const customOutput = await metadataType.mdtHandler.buildOutput(
            path1 + "/" + key + "/" + fileName,
            path2 + "/" + key + "/" + fileName
          );

          await fs.writeFile(
            outputPath + "/" + key + "/" + fileName,
            customOutput
          );
          continue;
        } catch (error) {
          // will just copy the source to the org
        }
      }
      try {
        await fs.copy(
          path1 + "/" + key + "/" + fileName,
          outputPath + "/" + key + "/" + fileName
        );
      } catch (error) {
        console.log("Error copy 1", error);
      }
      if (
        metadataType.hasContent &&
        (explodedTypes[metadataType.metadataName] ||
          bundleTypes.indexOf(metadataType.metadataName) < 0)
      ) {
        // console.log("\t", fileName + "-meta.xml");
        if (explodedTypes[metadataType.metadataName]) {
          // get the related xml if we're pushing the entire directory
          fileName = fileName + "." + explodedTypes[metadataType.metadataName];
        }
        try {
          await fs.copy(
            path1 + "/" + key + "/" + fileName + "-meta.xml",
            outputPath + "/" + key + "/" + fileName + "-meta.xml"
          );
        } catch (error) {
          console.log("Error copy 2", error);
        }
      }
    }
  }
}

// eslint-disable-next-line max-params
async function processEqualState(
  entry,
  name,
  metadataType,
  pathParts,
  toDelete,
  metadataTypeDir,
  fileDiffs
) {
  // if (name.indexOf("TestDoc1") >= 0) {
  //   console.log(entry);
  // }
  if (
    entry.type1 === "missing" &&
    // Only pass it through if it is not a bundle or is the xml file in the bundle
    (bundleTypes.indexOf(metadataType.metadataName) < 0 ||
      name.indexOf("-meta.xml") >= 0)
  ) {
    if (bundleTypes.indexOf(metadataType.metadataName) >= 0) {
      name = pathParts[0];
    }
    //  Make sure the component is registered for deletion
    if (toDelete[metadataTypeDir] === undefined) {
      toDelete[metadataTypeDir] = [];
    }
    if (toDelete[metadataTypeDir].indexOf(format("%s", name)) < 0) {
      toDelete[metadataTypeDir].push(format("%s", name));
    }

    // if this metadata entity is already registered, remove it
    if (
      fileDiffs[metadataTypeDir] !== undefined &&
      fileDiffs[metadataTypeDir].indexOf(format("%s", name)) >= 0
    ) {
      fileDiffs[metadataTypeDir].splice(
        fileDiffs[metadataTypeDir].indexOf(format("%s", name)),
        1
      );
    }
    return;
  }

  if (fileDiffs[metadataTypeDir] === undefined) {
    fileDiffs[metadataTypeDir] = [];
  }

  // handle bundles of metadata (aura, lwc, etc)
  if (bundleTypes.indexOf(metadataType.metadataName) >= 0) {
    if (
      toDelete[metadataTypeDir] !== undefined &&
      toDelete[metadataTypeDir].indexOf(format("%s", pathParts[0])) >= 0
    ) {
      // This component has been marked for deletion, do not add to changed components
      return;
    }
    // If the file is part of a bundle but is a surface level file, just drop the file type
    if (pathParts[0]) {
      name = pathParts[0];
    } else {
      name = name.replace(/\..*/, "");
    }
  }
  if (fullPathTypes.indexOf(metadataType.metadataName) >= 0) {
    pathParts.push(name);
    name = pathParts.join("/");
  }
  if (metadataType.hasContent) {
    // normalize the content name so we can handle bringing both components later
    name = name.replace("-meta.xml", "");
  }
  // de-dupe metadata references
  if (fileDiffs[metadataTypeDir].indexOf(format("%s", name)) < 0) {
    fileDiffs[metadataTypeDir].push(format("%s", name));
  }
}

export default async function doIt({
  apiVersion,
  path1,
  path2,
  outputPath,
  blockedTypes,
}) {
  metadataInfo = await getMetadataInfo();
  const packageXML = {
    Package: {
      $: {
        xmlns: "http://soap.sforce.com/2006/04/metadata",
      },
      types: [],
      version: [],
    },
  };
  packageXML.Package.version = apiVersion;

  const options = {
    compareContent: true,
    compareFileAsync: compareAsync,
    ignoreLineEnding: true,
    ignoreWhiteSpaces: true,
    excludeFilter: "package.xml",
    paths: [path1, path2],
    metadataInfo,
  };

  const res = await dircompare.compare(path1, path2, options);
  const toDelete = {};
  const fileDiffs = {};
  for (const entry of res.diffSet) {
    // Exists in target org but not in source
    // Will not correctly report missing fields in this format
    if (entry.type2 === "directory" || entry.type1 === "directory") {
      continue;
    }

    const name = entry.name1 ? entry.name1 : entry.name2;
    const pathParts = entry.relativePath.split(/[\\/]/);

    // dump the leading /
    pathParts.shift();
    const metadataTypeDir = pathParts.shift();
    const metadataType = metadataInfo[metadataTypeDir];

    if (metadataType === undefined) {
      continue;
    }

    if (blockedTypes.indexOf(metadataType.metadataName) >= 0) {
      continue;
    }

    if (entry.state !== "equal") {
      await processEqualState(
        entry,
        name,
        metadataType,
        pathParts,
        toDelete,
        metadataTypeDir,
        fileDiffs
      );
    }
  }

  await fs.ensureDir(outputPath);
  // process discovered changed files
  await buildOutput(fileDiffs, outputPath, path1, path2, packageXML);

  // build package.xml
  const builder = new Builder({
    xmldec: { version: "1.0", encoding: "UTF-8" },
  });
  const xml = builder.buildObject(packageXML);
  await fs.writeFile(outputPath + "/package.xml", xml);
  try {
    await fs.copy(
      path1 + "/destructiveChangesPost.xml",
      outputPath + "/destructiveChangesPost.xml"
    );
  } catch (error) {
    // console.log("Error copying desctructiveChangesPost.xml,", err);
  }
}
