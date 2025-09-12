/* eslint-disable no-await-in-loop */ // we're working with an org, can't really run in parallel
import { readFile } from 'node:fs/promises';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import type { AnyJson } from '@salesforce/ts-types';
import type { Record as JSFRecord } from '@jsforce/jsforce-node';
import { globby } from 'globby';
import { Parser } from 'xml2js';

import { Browser } from 'puppeteer';
import { CLIError } from '@oclif/core/errors';
import { getBrowser } from '../../../common/browser/browser-main.js';
import { escapeElementId, typeHarder } from '../../../common/browser/browser-helpers.js';
import { fieldData, fieldTypes } from '../../../common/chat/button/xml-map.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-devops', 'devops.chat.button');

export type DevopsChatButtonResult = object;

export type ProjectConfig = {
  packageDirectories: Array<{
    path: string;
    default?: boolean;
  }>;
  namespace?: string;
  sfdcLoginUrl?: string;
  sourceApiVersion: string;
};

type LiveChatButton = JSFRecord & {
  Id: string;
  DeveloperName?: string;
};

export default class DevopsChatButton extends SfCommand<DevopsChatButtonResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;

  public static readonly flags = {
    button: Flags.string({
      summary: messages.getMessage('flags.button.summary'),
      char: 'b',
      multiple: true,
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

  public async run(): Promise<DevopsChatButtonResult> {
    const { flags } = await this.parse(DevopsChatButton);

    // read in the project json to get the source paths
    const projectJson = (await this.project?.resolveProjectConfig()) as ProjectConfig;
    const packageDirectories = projectJson.packageDirectories;

    const buttonDirectories = [] as string[];
    for (const packageConfig of packageDirectories) {
      // do stuff with the array elements
      buttonDirectories.push(`${packageConfig.path}/**/liveChatButtons/*-meta.xml`);
    }

    // use puppeteer to set the community settings
    const username = flags['target-org'].getUsername();
    if (!username) {
      throw new Error('Username not specified');
    }

    const connection = flags['target-org'].getConnection(projectJson.sourceApiVersion);

    const [browser, page] = await getBrowser(this.config.runCommand.bind(this), username);
    this.browser = browser;

    // Workaround for not being able to manage Site.OptionsAllowGuestSupportApi via Metadata
    // https://success.salesforce.com/ideaView?id=0873A000000CYQzQAO

    // TODO: come back and fix the types so `reduce` can be typed correctly
    const buttons: Record<string, LiveChatButton> = (await connection.sobject('LiveChatButton').find()).reduce(
      (o, v) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-param-reassign
        o[v.DeveloperName] = v;
        return o;
      },
      {}
    );
    const filesToProcess = await globby(buttonDirectories);
    let buttonApiData = getButtonAPIMap(filesToProcess);

    // if flags are set, parse and filter buttons to load
    if (flags.button) {
      buttonApiData = buttonApiData.filter((b) => (flags.button ?? []).includes(b[0]));
    }

    const parser = new Parser();

    for (const b of buttonApiData) {
      const buttonName = b[0];
      const buttonPath = b[1];
      // read in XML file

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const xmlData = await parser.parseStringPromise(await readFile(buttonPath, 'utf8'));

      let buttonUrl = '573/e'; // path to a new button
      if (buttons[buttonName]) {
        // button exists, set path for edit
        buttonUrl = `${buttons[buttonName].Id}/e`;
      }

      /// Get URL for edit on Site
      let url = page.mainFrame().url();
      const orgBaseURL = new URL(url).origin;
      url = `${orgBaseURL}/${buttonUrl}`;
      /// Check the box for Support API Access

      await page.goto(url, { waitUntil: 'networkidle0' });

      // Special handling for developer name which is in the filename
      // not the XML data
      await typeHarder(page, escapeElementId(fieldData.developerName.domSelector), buttonName);
      // Apply XML to page
      for (const key of Object.keys(fieldData)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (xmlData.LiveChatButton[key]) {
          // Text
          if (fieldData[key].fieldType === fieldTypes.text) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            await typeHarder(page, escapeElementId(fieldData[key].domSelector), xmlData.LiveChatButton[key][0]);
          }

          // Checkbox
          if (fieldData[key].fieldType === fieldTypes.checkbox) {
            const checkbox = await page.$(escapeElementId(fieldData[key].domSelector));
            if (checkbox === null) {
              throw new Error(`unable to locate check box ${fieldData[key].domSelector}`);
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const expectedState = xmlData.LiveChatButton[key][0] === 'true';

            const checkedState = await (await checkbox.getProperty('checked')).jsonValue();

            if (checkedState !== expectedState) {
              await page.click(escapeElementId(fieldData[key].domSelector));
            }
          }

          // Picklist
          if (fieldData[key].fieldType === fieldTypes.picklist) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const val: string =
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              fieldData[key]?.domValueMap?.[xmlData.LiveChatButton[key][0]] ?? xmlData.LiveChatButton[key][0];
            await page.select(escapeElementId(fieldData[key].domSelector), val);
          }
        }
      }

      // Save
      try {
        // try and save and wait for the save to complete
        await Promise.all([
          page.click(escapeElementId(fieldData.saveButton.domSelector)),
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        const frameUrl = page.mainFrame().url();
        if (frameUrl.includes('editLiveChatButton.apexp')) {
          throw new Error('Page stayed on edit panel, save failure: ' + frameUrl);
        }
      } catch (error) {
        await page.waitForSelector('.errorMsg', { timeout: 10 * 1000 });
        const content = await page.evaluate(() => {
          // this happens inside the page, not inside the script
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          const errors = [...(globalThis as any).document.querySelectorAll('.errorMsg')];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          return errors.map((div) => div.textContent.trim()).filter((text) => text.length > 0);
        });
        // eslint-disable-next-line no-console
        console.error('Browser: errors found:', content);
        throw error;
      }
    }

    await this.browser.close();
    return {};
  }
}

function buttonApiNameFromFile(fileName: string): string {
  return fileName.replace(/.*liveChatButtons.(\w+)\.liveChatButton.*/, '$1');
}

function getButtonAPIMap(fileNames: string[]): string[][] {
  return fileNames.map((f) => [buttonApiNameFromFile(f), f]);
}
