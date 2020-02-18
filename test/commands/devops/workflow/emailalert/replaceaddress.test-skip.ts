// tslint:disable no-unused-expression
// Disabled rule due to expect being a dangling function
import { expect, test } from "@salesforce/command/lib/test";
import { readdirSync } from "fs";
import * as rimrafFunc from "rimraf";
import * as util from "util";
import { compareDirectories, print } from "../../../../utils/compare-dirs";

const rimraf = util.promisify(rimrafFunc) as any;

const KEEP_OUTPUT = true;

// This will run the tool against each folder in the ./test/commands/devops/workflow/emailalert/force-apps folder
// It needs a srcmdt and orgmdt and is expected to create an output folder
// with any items that srcmdt has that orgmdt does not, the output folder is compared to the expected folder
// if output matches expected then the job succeeds, otherwise the job fails
describe("devops:workflow:emailalert:replaceaddress", () => {
  before(async () => {
    await rimraf(
      "./test/commands/devops/workflow/emailalert/force-apps/**/output"
    );
  });

  after(async () => {
    if (KEEP_OUTPUT) {
      return;
    }
    await rimraf(
      "./test/commands/devops/workflow/emailalert/force-apps/**/output"
    );
  });

  readdirSync("./test/commands/devops/workflow/emailalert/force-apps/", {
    withFileTypes: true
  })
    .filter(dirent => dirent.isDirectory())
    .forEach(async dirent => {
      const dirName = dirent.name;
      test
        .withProject({ sourceApiVersion: "47.0" })
        .command([
          "devops:workflow:emailalert:replaceaddress",
          "--configfile",
          `./test/commands/devops/workflow/emailalert/force-apps/${dirName}/srcmdt`,
          "--changeddir",
          `./test/commands/devops/workflow/emailalert/force-apps/${dirName}/orgmdt`,
          "--outputdir",
          `./test/commands/devops/workflow/emailalert/force-apps/${dirName}/output`
        ])
        .it(
          `runs devops:mdsource:compare:build --basedir ./test/commands/devops/workflow/emailalert/force-apps/${dirName}/srcmdt --changeddir ./test/commands/devops/workflow/emailalert/force-apps/${dirName}/orgmdt --outputdir ./test/commands/devops/workflow/emailalert/force-apps/${dirName}/output`,
          async (/* ctx */) => {
            const res = await compareDirectories(
              `./test/commands/devops/workflow/emailalert/force-apps/${dirName}/expected`,
              `./test/commands/devops/workflow/emailalert/force-apps/${dirName}/output`
            );
            try {
              expect(
                res.same,
                `Expected ./test/commands/devops/workflow/emailalert/force-apps/${dirName}/expected and ./test/commands/devops/workflow/emailalert/force-apps/${dirName}/output to have the same content`
              ).to.be.ok;
            } catch (error) {
              print(res);
              throw error;
            }
          }
        );
    });
});
