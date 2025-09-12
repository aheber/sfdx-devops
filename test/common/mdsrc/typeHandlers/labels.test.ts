import { expect } from 'chai';
import LabelHandler from '../../../../src/common/mdsrc/typeHandlers/labels.js';

describe('compare custom labels', () => {
  it('find the differences between Custom Label files', async () => {
    const handler = new LabelHandler();
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
<CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">
    <labels>
        <fullName>Unchanged</fullName>
        <categories>Test</categories>
        <language>en_US</language>
        <protected>false</protected>
        <shortDescription>Unchanged</shortDescription>
        <value>Unchanged</value>
    </labels>
    <labels>
        <fullName>Deleted</fullName>
        <categories>Test</categories>
        <language>en_US</language>
        <protected>false</protected>
        <shortDescription>Deleted</shortDescription>
        <value>Deleted</value>
    </labels>
    <labels>
        <fullName>Changed</fullName>
        <categories>Test</categories>
        <language>en_US</language>
        <protected>false</protected>
        <shortDescription>Changed</shortDescription>
        <value>ChangedOldValue</value>
    </labels>
    <labels>
        <fullName>TagChanged</fullName>
        <categories>OldTag</categories>
        <language>en_US</language>
        <protected>false</protected>
        <shortDescription>TagChanged</shortDescription>
        <value>TagChanged</value>
    </labels>
</CustomLabels>`,
    src: `<?xml version="1.0" encoding="UTF-8" ?>
<CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">
    <labels>
        <fullName>Unchanged</fullName>
        <categories>Test</categories>
        <language>en_US</language>
        <protected>false</protected>
        <shortDescription>Unchanged</shortDescription>
        <value>Unchanged</value>
    </labels>
    <labels>
        <fullName>New</fullName>
        <categories>Test</categories>
        <language>en_US</language>
        <protected>false</protected>
        <shortDescription>New</shortDescription>
        <value>New</value>
    </labels>
    <labels>
        <fullName>Changed</fullName>
        <categories>Test</categories>
        <language>en_US</language>
        <protected>false</protected>
        <shortDescription>Changed</shortDescription>
        <value>Changed</value>
    </labels>
    <labels>
        <fullName>TagChanged</fullName>
        <categories>Test</categories>
        <language>en_US</language>
        <protected>false</protected>
        <shortDescription>TagChanged</shortDescription>
        <value>TagChanged</value>
    </labels>
</CustomLabels>`,
    expectedBuild: `<?xml version="1.0" encoding="UTF-8"?>
<CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">
  <labels>
    <fullName>New</fullName>
    <categories>Test</categories>
    <language>en_US</language>
    <protected>false</protected>
    <shortDescription>New</shortDescription>
    <value>New</value>
  </labels>
  <labels>
    <fullName>Changed</fullName>
    <categories>Test</categories>
    <language>en_US</language>
    <protected>false</protected>
    <shortDescription>Changed</shortDescription>
    <value>Changed</value>
  </labels>
  <labels>
    <fullName>TagChanged</fullName>
    <categories>Test</categories>
    <language>en_US</language>
    <protected>false</protected>
    <shortDescription>TagChanged</shortDescription>
    <value>TagChanged</value>
  </labels>
</CustomLabels>`,
    expectedChanges: {
      CustomLabels: {
        labels: [
          {
            fullName: ['New'],
            categories: ['Test'],
            language: ['en_US'],
            protected: ['false'],
            shortDescription: ['New'],
            value: ['New'],
          },
          {
            fullName: ['Changed'],
            categories: ['Test'],
            language: ['en_US'],
            protected: ['false'],
            shortDescription: ['Changed'],
            value: ['Changed'],
          },
          {
            fullName: ['TagChanged'],
            categories: ['Test'],
            language: ['en_US'],
            protected: ['false'],
            shortDescription: ['TagChanged'],
            value: ['TagChanged'],
          },
        ],
        $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
      },
    },
  };
}
