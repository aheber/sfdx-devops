import { Page } from 'puppeteer';

/* eslint-disable no-await-in-loop */
export async function typeHarder(page: Page, selector: string, content: string): Promise<void> {
  let i = 0;
  const iLimit = 15;
  while ((await page.$eval(selector, (el) => (el as HTMLInputElement).value.trim())) !== content) {
    // Ensure text input is clear
    await page.focus(selector);
    await page.$eval(selector, (el) =>
      (el as HTMLInputElement).setSelectionRange(0, (el as HTMLInputElement).value.length)
    );
    await page.keyboard.press('Backspace');
    // Try typing the character string into it
    await page.type(selector, content, { delay: 50 });
    // Iteration tolerance before giving up
    i++;
    if (i >= iLimit) {
      throw new Error(`Attempting to set ${selector} to content has failed in ${i} attempts`);
    }
  }
}

export function escapeElementId(val: string): string {
  return val.replaceAll(':', '\\:');
}
