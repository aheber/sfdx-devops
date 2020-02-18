import {flags, SfdxCommand} from "@salesforce/command";
import {Messages} from "@salesforce/core";
import compare from "../../../../common/mdsrc/compare";

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages("sfdx-devops", "mdsourceCompareBuild");

export default class Build extends SfdxCommand {
  public static description = messages.getMessage("commandDescription");

  public static examples = [
    `$ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
  Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
  My hub org id is: 00Dxx000000001234
  `,
    `$ sfdx hello:org --name myname --targetusername myOrg@example.com
  Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
  `,
  ];

  public static args = [];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    basedir: flags.string({
      char: "b",
      required: true,
      description: messages.getMessage("basedirFlagDescription"),
    }),
    changeddir: flags.string({
      char: "c",
      required: true,
      description: messages.getMessage("changeddirFlagDescription"),
    }),
    outputdir: flags.string({
      char: "o",
      required: true,
      description: messages.getMessage("outputdirFlagDescription"),
    }),
    destructivechanges: flags.string({
      char: "d",
      options: ["pre", "post"],
      description: messages.getMessage("destructivechangesFlagDescription"),
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = false;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<void> {
    // List files present in the org and missing from the src
    // var options = {compareContent: true};
    // read in project file to set the target API version
    const blockedTypes = ["StaticResource", "PlatformCachePartition"];

    const projectJson = await this.project.resolveProjectConfig();
    return compare({
      apiVersion: projectJson.sourceApiVersion,
      path1: this.flags.basedir,
      path2: this.flags.changeddir,
      outputPath: this.flags.outputdir,
      blockedTypes,
    });
  }
}
