import { URL } from 'node:url';
import puppeteer from 'puppeteer';
import { Command } from '@oclif/core';

const pageDefaultTimeoutSeconds = 120;

type OrgOpenOutput = {
  orgId: string;
  url: string;
  username: string;
};

// type CommandOutput<T> = {
//   status: number;
//   result: T;
// };

export async function getBrowser(
  runCommand: <T>(id: string, argv?: string[], cachedCommand?: Command.Loadable | null) => Promise<T>,
  targetUsername: string
): Promise<[puppeteer.Browser, puppeteer.Page]> {
  // TODO: I don't know if this will have a status wrapper or not
  const orgConfig = await runCommand<OrgOpenOutput>('org:open', ['--url-only', `--target-org=${targetUsername}`]);

  const shouldHeadless = (process.env.SFDX_DEVOPS_DISPLAYBROWSER ?? 'false').toLowerCase() === 'true';
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: !shouldHeadless,
  });
  const [page] = await browser.pages();
  page.setDefaultNavigationTimeout(pageDefaultTimeoutSeconds * 1000);
  await page.goto(orgConfig.url, { waitUntil: 'networkidle0' });

  const url = page.mainFrame().url();
  if (url.includes('test.salesforce.com')) {
    const newUrl = new URL(orgConfig.url);
    await page.goto(newUrl.origin, { waitUntil: 'networkidle0' });

    if (url.includes('test.salesforce.com')) {
      throw new Error(
        "ERROR: Loading org didn't succeed. Landed on test.salesforce.com. Known issue with Salesforce, please try creating another org"
      );
    }
  }

  return [browser, page];
}
