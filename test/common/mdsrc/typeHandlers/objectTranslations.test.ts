import { expect } from 'chai';
import Handler from '../../../../src/common/mdsrc/typeHandlers/objectTranslations.js';

describe('compare assignment rules', () => {
  it('should find the differences between assignment rules', async () => {
    const handler = new Handler();
    const content = getContent();
    const changes = await handler.getChanges(content.src, content.org);
    expect(changes).to.deep.equal(content.expectedChanges);
    const builtOutput = await handler.buildOutput(content.src, content.org);
    expect(builtOutput).to.equal(content.expectedBuild);
  });
});

function getContent() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8" ?>
<CustomObjectTranslation xmlns="http://soap.sforce.com/2006/04/metadata">
    <fields>
        <label><!-- Same --></label>
        <name>Same__c</name>
    </fields>
    <fields>
        <label><!-- Changed --></label>
        <name>Changed__c</name>
    </fields>
    <fields>
        <label><!-- New --></label>
        <name>Deleted__c</name>
    </fields>
    <layouts>
        <layout>Test Layout</layout>
        <sections>
            <label><!-- Same --></label>
            <section>Same</section>
        </sections>
        <sections>
            <label><!-- Changed --></label>
            <section>Changed</section>
        </sections>
        <sections>
            <label><!-- New --></label>
            <section>Deleted</section>
        </sections>
    </layouts>
    <quickActions>
        <label><!-- Same --></label>
        <name>Same</name>
    </quickActions>
    <quickActions>
        <label><!-- Changed --></label>
        <name>Changed</name>
    </quickActions>
    <quickActions>
        <label><!-- New --></label>
        <name>Deleted</name>
    </quickActions>
    <recordTypes>
        <label><!-- Same --></label>
        <name>Same</name>
    </recordTypes>
    <recordTypes>
        <label><!-- Changed --></label>
        <name>Changed</name>
    </recordTypes>
    <recordTypes>
        <label><!-- New --></label>
        <name>Deleted</name>
    </recordTypes>
    <webLinks>
        <label><!-- Same --></label>
        <name>Same</name>
    </webLinks>
    <webLinks>
        <label><!-- Changed --></label>
        <name>Changed</name>
    </webLinks>
    <webLinks>
        <label><!-- New --></label>
        <name>Deleted</name>
    </webLinks>
</CustomObjectTranslation>`,
    src: `<?xml version="1.0" encoding="UTF-8" ?>
<CustomObjectTranslation xmlns="http://soap.sforce.com/2006/04/metadata">
    <fields>
        <label><!-- Same --></label>
        <name>Same__c</name>
    </fields>
    <fields>
        <label>New value</label>
        <name>Changed__c</name>
    </fields>
    <fields>
        <label><!-- New --></label>
        <name>New__c</name>
    </fields>
    <layouts>
        <layout>Test Layout</layout>
        <sections>
            <label><!-- Same --></label>
            <section>Same</section>
        </sections>
        <sections>
            <label>New value</label>
            <section>Changed</section>
        </sections>
        <sections>
            <label><!-- New --></label>
            <section>New</section>
        </sections>
    </layouts>
    <quickActions>
        <label><!-- Same --></label>
        <name>Same</name>
    </quickActions>
    <quickActions>
        <label>New value</label>
        <name>Changed</name>
    </quickActions>
    <quickActions>
        <label><!-- New --></label>
        <name>New</name>
    </quickActions>
    <recordTypes>
        <label><!-- Same --></label>
        <name>Same</name>
    </recordTypes>
    <recordTypes>
        <label>New value</label>
        <name>Changed</name>
    </recordTypes>
    <recordTypes>
        <label><!-- New --></label>
        <name>New</name>
    </recordTypes>
    <webLinks>
        <label><!-- Same --></label>
        <name>Same</name>
    </webLinks>
    <webLinks>
        <label>New value</label>
        <name>Changed</name>
    </webLinks>
    <webLinks>
        <label><!-- New --></label>
        <name>New</name>
    </webLinks>
</CustomObjectTranslation>`,
    expectedBuild: `<?xml version="1.0" encoding="UTF-8"?>
<CustomObjectTranslation xmlns="http://soap.sforce.com/2006/04/metadata">
  <fields>
    <label>New value</label>
    <name>Changed__c</name>
  </fields>
  <fields>
    <label/>
    <name>New__c</name>
  </fields>
  <layouts>
    <layout>Test Layout</layout>
    <sections>
      <label/>
      <section>Same</section>
    </sections>
    <sections>
      <label>New value</label>
      <section>Changed</section>
    </sections>
    <sections>
      <label/>
      <section>New</section>
    </sections>
  </layouts>
  <quickActions>
    <label>New value</label>
    <name>Changed</name>
  </quickActions>
  <quickActions>
    <label/>
    <name>New</name>
  </quickActions>
  <recordTypes>
    <label>New value</label>
    <name>Changed</name>
  </recordTypes>
  <recordTypes>
    <label/>
    <name>New</name>
  </recordTypes>
  <webLinks>
    <label>New value</label>
    <name>Changed</name>
  </webLinks>
  <webLinks>
    <label/>
    <name>New</name>
  </webLinks>
</CustomObjectTranslation>`,
    expectedChanges: {
      CustomObjectTranslation: {
        $: {
          xmlns: 'http://soap.sforce.com/2006/04/metadata',
        },
        fields: [
          {
            label: ['New value'],
            name: ['Changed__c'],
          },
          {
            label: [''],
            name: ['New__c'],
          },
        ],
        layouts: [
          {
            layout: ['Test Layout'],
            sections: [
              {
                label: [''],
                section: ['Same'],
              },
              {
                label: ['New value'],
                section: ['Changed'],
              },
              {
                label: [''],
                section: ['New'],
              },
            ],
          },
        ],
        quickActions: [
          {
            label: ['New value'],
            name: ['Changed'],
          },
          {
            label: [''],
            name: ['New'],
          },
        ],
        recordTypes: [
          {
            label: ['New value'],
            name: ['Changed'],
          },
          {
            label: [''],
            name: ['New'],
          },
        ],
        webLinks: [
          {
            label: ['New value'],
            name: ['Changed'],
          },
          {
            label: [''],
            name: ['New'],
          },
        ],
      },
    },
  };
}
