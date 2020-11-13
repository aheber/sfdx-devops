/* eslint-disable no-await-in-loop */
const puppeteer = require("puppeteer");
const URL = require("url").URL;
import { OrgOpenCommand } from "salesforce-alm/dist/commands/force/org/open";

const pageDefaultTimeoutSeconds = 120;

async function getOrgURL(targetUsername) {
  return OrgOpenCommand.run([
    "--urlonly",
    `--targetusername=${targetUsername}`,
  ]);
}

export async function getBrowser(targetUsername) {
  const orgConfig = await getOrgURL(targetUsername);

  const shouldHeadless =
    (process.env.SFDX_DEVOPS_DISPLAYBROWSER || "false").toLowerCase() ===
    "true";
  const browser = await puppeteer.launch({
    headless: shouldHeadless,
    args: ["--no-sandbox"],
  });
  const page = (await browser.pages())[0];
  page.setDefaultNavigationTimeout(pageDefaultTimeoutSeconds * 1000);
  await page.goto(orgConfig.url, { waitUntil: "networkidle0" });

  const url = page.mainFrame().url();
  if (url.indexOf("test.salesforce.com") > -1) {
    const newUrl = new URL(orgConfig.url);
    await page.goto(newUrl.origin, { waitUntil: "networkidle0" });

    if (url.indexOf("test.salesforce.com") > -1) {
      throw new Error(
        "ERROR: Loading org didn't succeed. Landed on test.salesforce.com. Known issue with Salesforce, please try creating another org"
      );
    }
  }

  return [browser, page];
}
