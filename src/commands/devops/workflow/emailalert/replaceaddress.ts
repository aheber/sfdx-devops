/* eslint-disable no-await-in-loop */
import { flags, SfdxCommand } from "@salesforce/command";
import * as fs from "fs-extra";
import { Messages } from "@salesforce/core";
import { JsonMap } from "@salesforce/ts-types";
import { readFileSync } from "fs-extra";
import * as globby from "globby";
import * as yaml from "js-yaml";
import { Builder, Parser } from "xml2js";

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages(
  "sfdx-devops",
  "workflowEmailAlertReplaceAddress"
);

const genericEmailTypes = ["CurrentUser", "DefaultWorkflowUser"];

export default class ReplaceAddress extends SfdxCommand {
  public static description = messages.getMessage("commandDescription");

  public static examples = [
    `$ sfdx devops:workflow:emailalert:replaceaddress --configfile config/alertconfig.yaml
  `,
  ];

  public static args = [];

  protected static flagsConfig = {
    configfile: flags.string({
      char: "c",
      required: true,
      description: messages.getMessage("configfileFlagDescription"),
      default: "config/alertconfig.yaml",
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = false;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = false;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<JsonMap> {
    // read in the YAML config file
    // TODO: error handling
    const settings = yaml.load(readFileSync(this.flags.configfile, "utf8"));
    // build a list of filenames that we're looking for
    const targetFiles = Object.keys(settings).map(
      (k) => `${k}.workflow-meta.xml`
    );
    // read in the project json to get the source paths
    const projectJson = await this.project.resolveProjectConfig();
    const paths = (projectJson.packageDirectories as JsonMap[]).map(
      (p) => p.path as string
    );
    // Transform the workflow's email alerts by name as properties in the YAML config
    const filesToProcess = await globby(paths, {
      expandDirectories: targetFiles,
    });
    // read in each XML file in filesToProcess
    // access the alerts object and find the element with the correct name, perform the replacement, rewrite the file in place

    const parser = new Parser();
    for (const f of filesToProcess) {
      // get the object name from the filename
      const matches = f.match(/([^/]+)\.workflow-meta\.xml/);
      const objectName = matches[1];
      const contents = await fs.readFile(f);
      const wfDoc = await parser.parseStringPromise(contents);

      // eslint-disable-next-line guard-for-in
      for (const alertName in settings[objectName]) {
        const targetEmailName = settings[objectName][alertName];
        if (wfDoc.Workflow.alerts === undefined) {
          console.error(`${f} does not contain any 'alerts'`);
          break;
        }
        const alrt = wfDoc.Workflow.alerts.find(
          (a) => a.fullName.indexOf(alertName) >= 0
        );
        // set the email alert correctly, special handling for generic types rather than named orgwide email addresses
        if (genericEmailTypes.indexOf(targetEmailName) >= 0) {
          alrt.senderAddress = undefined;
          alrt.senderType[0] = targetEmailName;
        } else {
          alrt.senderAddress = [targetEmailName];
          alrt.senderType = ["OrgWideEmailAddress"];
        }
        const builder = new Builder({
          xmldec: { version: "1.0", encoding: "UTF-8" },
          renderOpts: { pretty: true, indent: "    " },
        });
        const xmlOut = builder.buildObject(wfDoc);
        await fs.writeFile(f, xmlOut);
      }
    }
    return { settings, filesProcessed: filesToProcess };
  }
}
