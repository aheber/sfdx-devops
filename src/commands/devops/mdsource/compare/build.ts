import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import compare from '../../../../common/mdsrc/compare.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-devops', 'devops.mdsource.compare.build');

export type DevopsMdsourceCompareBuildResult = object;

export default class DevopsMdsourceCompareBuild extends SfCommand<DevopsMdsourceCompareBuildResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;

  public static readonly flags = {
    name: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      description: messages.getMessage('flags.name.description'),
      char: 'n',
      required: false,
    }),
    basedir: Flags.directory({
      summary: messages.getMessage('flags.basedir.summary'),
      char: 'b',
      required: true,
      exists: true,
    }),
    changeddir: Flags.directory({
      summary: messages.getMessage('flags.changeddir.summary'),
      char: 'c',
      required: true,
      exists: true,
    }),
    destructivechanges: Flags.option({
      summary: messages.getMessage('flags.destructivechanges.summary'),
      char: 'd',
      options: ['pre', 'post'] as const,
    })(),
    outputdir: Flags.directory({
      summary: messages.getMessage('flags.outputdir.summary'),
      char: 'p',
      required: true,
    }),
  };

  public async run(): Promise<DevopsMdsourceCompareBuildResult> {
    const { flags } = await this.parse(DevopsMdsourceCompareBuild);

    // List files present in the org and missing from the src
    // var options = {compareContent: true};
    // read in project file to set the target API version
    const blockedTypes = ['StaticResource', 'PlatformCachePartition'];

    if (!this.project) {
      throw new Error('Should be run in a project context');
    }

    const projectJson = await this.project.resolveProjectConfig();
    await compare({
      apiVersion: projectJson.sourceApiVersion as string,
      blockedTypes,
      outputPath: flags.outputdir,
      path1: flags.basedir,
      path2: flags.changeddir,
    });
    return {};
  }
}
