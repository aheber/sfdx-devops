/* eslint-disable no-await-in-loop */
import { flags, SfdxCommand } from "@salesforce/command";
import { Messages } from "@salesforce/core";
import { getBrowser } from "../../../common/browser/browser-main";
import {
  escapeElementId,
  typeHarder,
} from "../../../common/browser/browser-helpers";
import * as globby from "globby";
import { fieldData, fieldTypes } from "../../../common/chat/button/xml-map";
import { Parser } from "xml2js";
import { promises as fs } from "fs-extra";

import { URL } from "url";

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages("sfdx-devops", "chatButton");

export default class Button extends SfdxCommand {
  public static description = messages.getMessage("commandDescription");

  public static examples = [
    "$ devops:chat:buttons",
    "$ devops:chat:buttons -b Button_1,Button_2",
  ];

  public static args = [];

  protected static flagsConfig = {
    buttons: flags.string({
      char: "b",
      required: false,
      description: messages.getMessage("buttonsFlagDescription"),
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<void> {
    const projectJson = await this.project.resolveProjectConfig();
    const packageDirectories: any[] = projectJson.packageDirectories; // tslint:disable-line:no-any

    const buttonDirectories = [] as string[];
    for (const packageConfig of packageDirectories) {
      // do stuff with the array elements
      buttonDirectories.push(
        `${packageConfig.path}/**/liveChatButtons/*-meta.xml`
      );
    }

    const username = this.org.getUsername();

    const [browser, page] = await getBrowser(username);
    // Workaround for not being able to manage Site.OptionsAllowGuestSupportApi via Metadata
    // https://success.salesforce.com/ideaView?id=0873A000000CYQzQAO

    const buttons = (
      await (await this.org.getConnection()).sobject("LiveChatButton").find()
    ).reduce((o, v) => {
      o[v.DeveloperName] = v;
      return o;
    }, {});
    console.log("Buttons ", buttons);

    console.log(buttonDirectories);
    const filesToProcess = await globby(buttonDirectories);
    let buttonApiData = this.getButtonAPIMap(filesToProcess);
    console.log(buttonApiData);

    // if flags are set, parse and filter buttons to load
    if (this.flags.buttons) {
      const buttonNames = this.flags.buttons.split(/ *, */);
      console.log(buttonNames);
      buttonApiData = buttonApiData.filter(
        (b) => buttonNames.indexOf(b[0]) >= 0
      );
    }

    console.log("Button Data to run:", buttonApiData);
    const parser = new Parser();

    for (const b of buttonApiData) {
      const buttonName = b[0];
      const buttonPath = b[1];
      // read in XML file
      // eslint-disable-next-line no-await-in-loop
      const xmlData = await parser.parseStringPromise(
        // eslint-disable-next-line no-await-in-loop
        await fs.readFile(buttonPath)
      );

      let buttonUrl = "573/e"; // path to a new button
      if (buttons[buttonName]) {
        // button exists, set path for edit
        buttonUrl = `${buttons[buttonName].Id}/e`;
      }

      /// Get URL for edit on Site
      let url = page.mainFrame().url();
      const orgBaseURL = new URL(url).origin;
      url = `${orgBaseURL}/${buttonUrl}`;
      /// Check the box for Support API Access
      // eslint-disable-next-line no-await-in-loop
      await page.goto(url, { waitUntil: "networkidle0" });

      // Special handling for developer name which is in the filename
      // not the XML data
      await typeHarder(
        page,
        escapeElementId(fieldData.developerName.domSelector),
        buttonName
      );
      // Apply XML to page
      for (const key of Object.keys(fieldData)) {
        console.log("Key:", key);
        console.log("Value:", xmlData.LiveChatButton[key]);
        if (xmlData.LiveChatButton[key]) {
          // Text
          if (fieldData[key].fieldType === fieldTypes.text) {
            await typeHarder(
              page,
              escapeElementId(fieldData[key].domSelector),
              xmlData.LiveChatButton[key][0]
            );
          }
          // Checkbox

          // Picklist
          if (fieldData[key].fieldType === fieldTypes.picklist) {
            console.log("Value Map", fieldData[key]?.domValueMap);
            console.log("Matched Value", xmlData.LiveChatButton[key][0]);
            console.log(
              "Resolved Value",
              fieldData[key]?.domValueMap?.[xmlData.LiveChatButton[key][0]]
            );
            const val =
              fieldData[key]?.domValueMap?.[xmlData.LiveChatButton[key][0]] ||
              xmlData.LiveChatButton[key][0];
            console.log("setting to", val);
            await page.select(escapeElementId(fieldData[key].domSelector), val);
          }
        }
      }

      // Save
      try {
        // try and save and wait for the save to complete
        await Promise.all([
          page.click(escapeElementId(fieldData.saveButton.domSelector)),
          page.waitForNavigation({ waitUntil: "networkidle0" }),
        ]);
      } catch (e) {
        // error when routing to the save page, report on the save errors
        let document;
        if (document) {
          console.log("fake it for now");
        }
        // let workflowName = await frame.evaluate(() => {return document.querySelector("#workflowUserId").value});
        // console.log('Browser: ERROR: Saving Default Workflow User failed');
        // console.log('Browser: Content of workflow user field:',workflowName);
        await page.waitForSelector(".errorMsg", { timeout: 10 * 1000 });
        const content = await page.evaluate(() => {
          const errors = [...document.querySelectorAll(".errorMsg")];
          return errors.map((div) => div.textContent.trim());
        });
        console.log("Browser: errors found:", content);
        url = page.mainFrame().url();
        console.log("Browser: Main page URL:", url);
      }
    }

    await browser.close();
  }

  async getSiteURL(siteName) {
    const conn = this.org.getConnection();
    const site = await conn.sobject("Site").findOne({ Name: siteName });
    return site.Id;
  }

  async setGuestApi(page, desired) {
    const guestApiSelector =
      "#thePage:theForm:thePageBlock:thePageBlockSection:supportApiSection:AllowGuestSupportApi";
    await page.waitForSelector(escapeElementId(guestApiSelector), {
      timeout: 20 * 1000,
    });
    const checkedState = await (
      await (await page.$(escapeElementId(guestApiSelector))).getProperty(
        "checked"
      )
    ).jsonValue();

    if (checkedState !== desired) {
      await page.click(escapeElementId(guestApiSelector));
    }
  }

  getButtonAPIMap(fileNames) {
    return fileNames.map((f) => [this.buttonApiNameFromFile(f), f]);
  }

  buttonApiNameFromFile(fileName) {
    return fileName.replace(/.*liveChatButtons.(\w+)\.liveChatButton.*/, "$1");
  }
}