/* eslint-disable no-warning-comments */
// TODO: TESTS TO WRITE
// TODO: Ensure destructiveChangesPost.xml is created if the command flag is pas  sed

// TODO: only specific translations
// TODO: only specific custom fields on objects
// TODO: only changed WFRs
// TODO: only changed Validation Rules

// tslint:disable no-unused-expression
// Disabled rule due to expect being a dangling function
import { expect, test } from "@salesforce/command/lib/test";
import { readdirSync } from "fs";
import * as rimrafFunc from "rimraf";
import * as util from "util";
const rimraf = util.promisify(rimrafFunc) as any;
import { compareDirectories, print } from "../../../../utils/compare-dirs";
// import { ensureJsonMap, ensureString } from "@salesforce/ts-types";

const KEEP_OUTPUT = false;

// This will run the tool against each folder in the ./test/force-apps folder
// It needs a srcmdt and orgmdt and is expected to create an output folder
// with any items that srcmdt has that orgmdt does not, the output folder is compared to the expected folder
// if output matches expected then the job succeeds, otherwise the job fails
describe("devops:mdsource:compare:build", () => {
  before(async () => {
    await rimraf(
      "./test/commands/devops/mdsource/compare/force-apps/**/output"
    );
  });
  afterEach(async () => {
    if (KEEP_OUTPUT) {
      return;
    }
    await rimraf(
      "./test/commands/devops/mdsource/compare/force-apps/**/output"
    );
  });
  // beforeEach(async () => {
  //   if (KEEP_OUTPUT) {
  //     return;
  //   }
  //   await rimraf(`./test/force-apps/**/output`);
  // });

  readdirSync("./test/commands/devops/mdsource/compare/force-apps", {
    withFileTypes: true
  })
    .filter(dirent => dirent.isDirectory())
    .forEach(async dirent => {
      const dirName = dirent.name;
      // console.log("Test", dirName);
      // if (dirName !== "testLabels") {
      //   return;
      // }
      test
        .withProject({ sourceApiVersion: "47.0" })
        .command([
          "devops:mdsource:compare:build",
          "--basedir",
          `./test/commands/devops/mdsource/compare/force-apps/${dirName}/srcmdt`,
          "--changeddir",
          `./test/commands/devops/mdsource/compare/force-apps/${dirName}/orgmdt`,
          "--outputdir",
          `./test/commands/devops/mdsource/compare/force-apps/${dirName}/output`
        ])
        .it(
          `runs devops:mdsource:compare:build --basedir ./test/commands/devops/mdsource/compare/force-apps/${dirName}/srcmdt --changeddir ./test/commands/devops/mdsource/compare/force-apps/${dirName}/orgmdt --outputdir ./test/commands/devops/mdsource/compare/force-apps/${dirName}/output`,
          async (/* ctx */) => {
            const res = await compareDirectories(
              `./test/commands/devops/mdsource/compare/force-apps/${dirName}/expected`,
              `./test/commands/devops/mdsource/compare/force-apps/${dirName}/output`
            );
            try {
              expect(
                res.same,
                `In ./test/commands/devops/mdsource/compare/force-apps/, Expected ${dirName}/expected and ${dirName}/output to have the same content`
              ).to.be.ok;
            } catch (error) {
              print(res);
              throw error;
            }
          }
        );
    });
});
