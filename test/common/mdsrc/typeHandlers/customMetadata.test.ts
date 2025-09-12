import { expect } from 'chai';
import Handler from '../../../../src/common/mdsrc/typeHandlers/customMetadata.js';

describe('compare custom metadata records', () => {
  it('should see identical MDT records as the same', async () => {
    const handler = new Handler();
    const content = getContentSame();
    expect(
      await handler.compare(
        'src/customMetadata/Test1.TestType.md-meta.xml',
        content.src,
        'org/customMetadata/Test1.TestType.md-meta.xml',
        content.org
      )
    ).to.be.true;
  });

  it('should report different MDT records', async () => {
    const handler = new Handler();
    const content = getContentDifferent();
    expect(
      await handler.compare(
        'src/customMetadata/Test1.TestType.md-meta.xml',
        content.src,
        'org/customMetadata/Test1.TestType.md-meta.xml',
        content.org
      )
    ).to.be.false;
  });
});

function getContentSame() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>Test MDT Record</label>
    <protected>false</protected>
    <values>
        <field>Field1__c</field>
        <value xsi:type="xsd:string">Test Value</value>
    </values>
    <values>
        <field>Field2__c</field>
        <value xsi:type="xsd:double">5.0</value>
    </values>
    <values>
        <field>Field3__c</field>
        <value xsi:type="xsd:boolean">false</value>
    </values>
</CustomMetadata>
`,
    src: `<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>Test MDT Record</label>
    <protected>false</protected>
    <values>
        <field>Field1__c</field>
        <value xsi:type="xsd:string">Test Value</value>
    </values>
    <values>
        <field>Field2__c</field>
        <value xsi:type="xsd:double">5.0</value>
    </values>
    <values>
        <field>Field3__c</field>
        <value xsi:type="xsd:boolean">false</value>
    </values>
</CustomMetadata>
`,
  };
}

function getContentDifferent() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>Test MDT Record</label>
    <protected>false</protected>
    <values>
        <field>Field1__c</field>
        <value xsi:type="xsd:string">Test Value</value>
    </values>
    <values>
        <field>Field2__c</field>
        <value xsi:type="xsd:double">5.0</value>
    </values>
    <values>
        <field>Field3__c</field>
        <value xsi:type="xsd:boolean">false</value>
    </values>
</CustomMetadata>
`,
    src: `<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>Test MDT Record</label>
    <protected>false</protected>
    <values>
        <field>Field1__c</field>
        <value xsi:type="xsd:string">Different string</value>
    </values>
    <values>
        <field>Field2__c</field>
        <value xsi:type="xsd:double">5.0</value>
    </values>
    <values>
        <field>Field3__c</field>
        <value xsi:type="xsd:boolean">false</value>
    </values>
</CustomMetadata>
`,
  };
}
