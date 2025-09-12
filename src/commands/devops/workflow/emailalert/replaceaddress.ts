/* eslint-disable no-await-in-loop */
import { readFileSync, writeFileSync } from 'node:fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { globby } from 'globby';
import { load } from 'js-yaml';
import { Builder, Parser } from 'xml2js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-devops', 'devops.workflow.emailalert.replaceaddress');
const genericEmailTypes = new Set(['CurrentUser', 'DefaultWorkflowUser']);

export type DevopsWorkflowEmailalertReplaceaddressResult = {
  filesProcessed: string[];
  settings: Record<string, Record<string, string>>;
};

type ProjectConfig = {
  packageDirectories: Array<{
    path: string;
    default?: boolean;
  }>;
};

type WorkflowMetadata = {
  Workflow: {
    alerts: Array<{
      fullName: string[];
      senderType: string[];
      senderAddress?: string[];
    }>;
  };
};

export default class DevopsWorkflowEmailalertReplaceaddress extends SfCommand<DevopsWorkflowEmailalertReplaceaddressResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;

  public static readonly flags = {
    configfile: Flags.file({
      summary: messages.getMessage('flags.configfile.summary'),
      char: 'c',
      exists: true,
      required: true,
      default: 'config/alertconfig.yaml',
    }),
  };

  public async run(): Promise<DevopsWorkflowEmailalertReplaceaddressResult> {
    if (!this.project) {
      throw new Error('Project not setup and available');
    }
    const { flags } = await this.parse(DevopsWorkflowEmailalertReplaceaddress);
    const fileContents = readFileSync(flags.configfile, { encoding: 'utf8' });
    const settings = load(fileContents) as Record<string, Record<string, string>>;

    const targetFiles = Object.keys(settings).map((k) => `${k}.workflow-meta.xml`);

    // read in the project json to get the source paths
    const projectJson = (await this.project.resolveProjectConfig()) as ProjectConfig;
    const paths = projectJson.packageDirectories.map((p) => p.path);

    const filesToProcess = await globby(paths, {
      expandDirectories: targetFiles,
    });

    const parser = new Parser();
    for (const f of filesToProcess) {
      // get the object name from the filename
      const matches = f.match(/([^/]+)\.workflow-meta\.xml/);
      if (matches == null || matches.length < 2) {
        throw new Error("Couldn't match filename for workflow-meta");
      }
      const objectName = matches[1];
      const contents = readFileSync(f);
      const wfDoc = (await parser.parseStringPromise(contents)) as WorkflowMetadata;

      // eslint-disable-next-line guard-for-in
      for (const alertName in settings[objectName]) {
        const targetEmailName = settings[objectName][alertName];
        if (wfDoc.Workflow.alerts === undefined) {
          throw new Error(`${f} does not contain any 'alerts'`);
        }

        const alrt = wfDoc.Workflow.alerts.find((a) => a.fullName.includes(alertName));
        if (!alrt) {
          throw new Error(`Expected alert [${alertName}] not found in [${objectName}]`);
        }
        // set the email alert correctly, special handling for generic types rather than named orgwide email addresses
        if (genericEmailTypes.has(targetEmailName)) {
          alrt.senderAddress = undefined;
          alrt.senderType[0] = targetEmailName;
        } else {
          alrt.senderAddress = [targetEmailName];
          alrt.senderType = ['OrgWideEmailAddress'];
        }

        const builder = new Builder({
          renderOpts: { indent: '    ', pretty: true },
          xmldec: { encoding: 'UTF-8', version: '1.0' },
        });
        const xmlOut = builder.buildObject(wfDoc);
        writeFileSync(f, xmlOut);
      }
    }

    return { filesProcessed: filesToProcess, settings };
  }
}
