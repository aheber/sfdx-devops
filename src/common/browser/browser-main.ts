/* eslint-disable no-await-in-loop */
const puppeteer = require("puppeteer");
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

  const shouldHeadless = true;
  const browser = await puppeteer.launch({
    headless: shouldHeadless,
    args: ["--no-sandbox"],
  });
  const page = (await browser.pages())[0];
  page.setDefaultNavigationTimeout(pageDefaultTimeoutSeconds * 1000);
  await page.goto(orgConfig.url, { waitUntil: "networkidle0" });

  const url = page.mainFrame().url();
  if (url.indexOf("test.salesforce.com") > -1) {
    throw new Error(
      "ERROR: Loading org didn't succeed. Landed on test.salesforce.com. Known issue with Salesforce, please try creating another org"
    );
  }

  return [browser, page];
}
