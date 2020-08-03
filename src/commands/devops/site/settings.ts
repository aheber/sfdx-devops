import { flags, SfdxCommand } from "@salesforce/command";
import { Messages } from "@salesforce/core";
import { getBrowser } from "../../../common/browser/browser-main";
import { escapeElementId } from "../../../common/browser/browser-helpers";

import { URL } from "url";

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages("sfdx-devops", "siteSettings");

export default class Settings extends SfdxCommand {
  public static description = messages.getMessage("commandDescription");

  public static examples = [
    "$ devops:site:settings -s Help_Center -g true",
    "$ devops:site:settings -s Help_Center -g false",
  ];

  public static args = [];

  private browser;

  protected static flagsConfig = {
    sitename: flags.string({
      char: "s",
      required: true,
      description: messages.getMessage("sitenameFlagDescription"),
    }),
    guestapi: flags.string({
      char: "g",
      required: false,
      options: ["true", "false"],
      description: messages.getMessage("guestApiFlagDescription"),
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<void> {
    // use puppeteer to set the community settings

    const username = this.org.getUsername();

    const [browser, page] = await getBrowser(username);
    this.browser = browser;
    // Workaround for not being able to manage Site.OptionsAllowGuestSupportApi via Metadata
    // https://success.salesforce.com/ideaView?id=0873A000000CYQzQAO

    /// Get URL for edit on Site
    const siteId = await this.getSiteURL(this.flags.sitename);
    let url = page.mainFrame().url();
    const orgBaseURL = new URL(url).origin;
    url = `${orgBaseURL}/${siteId}/e`;
    /// Check the box for Support API Access
    await page.goto(url, { waitUntil: "networkidle0" });

    try {
      /* Start settings management */
      if (this.flags.guestapi) {
        await this.setGuestApi(page, this.flags.guestapi === "true");
      }

      /* Save the site */
      await Promise.all([
        page.click(
          escapeElementId(
            "#thePage:theForm:thePageBlock:thePageBlockButtons:save"
          )
        ),
        page.waitForNavigation({ waitUntil: "networkidle0" }),
      ]);
    } catch (error) {
      console.error("Browser: ERROR: Error saving Support API setting", error);
      throw error;
    }
    await this.browser.close();
  }

  async catch(error) {
    if (this.browser) {
      await this.browser.close();
    }
    super.catch(error);
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
}
