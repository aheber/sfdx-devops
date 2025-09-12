import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import { Connection } from '@salesforce/core';
import { Page, Browser } from 'puppeteer';
import { CLIError } from '@oclif/core/errors';
import type { AnyJson } from '@salesforce/ts-types';

import { escapeElementId } from '../../../common/browser/browser-helpers.js';
import { getBrowser } from '../../../common/browser/browser-main.js';
import type { ProjectConfig } from '../chat/button.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-devops', 'devops.site.settings');

export type DevopsSiteSettingsResult = {
  path?: string;
};

export default class DevopsSiteSettings extends SfCommand<DevopsSiteSettingsResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresUsername = true;

  public static readonly flags = {
    guestapi: Flags.string({
      summary: messages.getMessage('flags.guestapi.summary'),
      char: 'g',
    }),
    sitename: Flags.string({
      summary: messages.getMessage('flags.sitename.summary'),
      char: 's',
      required: true,
    }),
    'target-org': Flags.requiredOrg(),
  };

  private browser?: Browser;

  public async catch(error: Error | CLIError | SfError<AnyJson>): Promise<never> {
    if (this.browser) {
      await this.browser.close();
    }

    await super.catch(error);
    throw error;
  }

  public async run(): Promise<DevopsSiteSettingsResult> {
    const { flags } = await this.parse(DevopsSiteSettings);

    // use puppeteer to set the community settings
    const username = flags['target-org'].getUsername();
    if (!username) {
      throw new Error('Username not specified');
    }
    // read in the project json to get the source paths
    const projectJson = (await this.project?.resolveProjectConfig()) as ProjectConfig;
    const connection = flags['target-org'].getConnection(projectJson.sourceApiVersion);

    const [browser, page] = await getBrowser(this.config.runCommand.bind(this), username);
    this.browser = browser;
    // Workaround for not being able to manage Site.OptionsAllowGuestSupportApi via Metadata
    // https://success.salesforce.com/ideaView?id=0873A000000CYQzQAO

    /// Get URL for edit on Site
    const siteId = await getSiteURL(connection, flags.sitename);
    let url = page.mainFrame().url();
    const orgBaseURL = new URL(url).origin;
    url = `${orgBaseURL}/${siteId}/e`;
    /// Check the box for Support API Access
    await page.goto(url, { waitUntil: 'networkidle0' });

    /* Start settings management */
    if (flags.guestapi) {
      await setGuestApi(page, flags.guestapi === 'true');
    }

    /* Save the site */
    await Promise.all([
      page.click(escapeElementId('#thePage:theForm:thePageBlock:thePageBlockButtons:save')),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    await this.browser.close();
    return {};
  }
}

async function getSiteURL(connection: Connection, siteName: string): Promise<string> {
  const site = await connection.sobject('Site').findOne({ Name: siteName });
  if (!site) {
    throw new Error('Unable to find Site named ' + siteName);
  }
  return site.Id as string;
}

async function setGuestApi(page: Page, desired: boolean): Promise<void> {
  const guestApiSelector = '#thePage:theForm:thePageBlock:thePageBlockSection:supportApiSection:AllowGuestSupportApi';
  await page.waitForSelector(escapeElementId(guestApiSelector), {
    timeout: 20 * 1000,
  });
  const escapedSelector = escapeElementId(guestApiSelector);
  const selectedElement = await page.$(escapedSelector);
  if (!selectedElement) {
    throw new Error(`Unable to find "${guestApiSelector}" on page`);
  }
  const checkedState = await (await selectedElement.getProperty('checked')).jsonValue();

  if (checkedState !== desired) {
    await page.click(escapeElementId(guestApiSelector));
  }
}
