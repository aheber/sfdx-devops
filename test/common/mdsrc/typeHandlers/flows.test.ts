import { expect } from 'chai';
import Handler from '../../../../src/common/mdsrc/typeHandlers/flows.js';

describe('compare flows', () => {
  it('should see identical Flow records as the same', async () => {
    const handler = new Handler();
    expect(handler.getCoreObjectName()).to.equal('Flow');
    const content = getContentUnchanged();
    expect(await handler.compare('src/flows/test1.flow', content.src, 'org/flows/test1.flow', content.org)).to.be.true;
    expect(await handler.addFiles('src/flows/test1.flow', content.src)).to.deep.equal([]);
    expect(await handler.addToPackageXml('src/flows/test1.flow', content.src)).to.deep.equal({});
  });

  it('should report different Flow records', async () => {
    const handler = new Handler();
    const content = getContentChanged();
    expect(await handler.compare('src/flows/test1.flow', content.src, 'org/flows/test1.flow', content.org)).to.be.false;
    expect(await handler.addFiles('src/flows/test1.flow', content.src)).to.deep.equal([]);
    expect(await handler.addToPackageXml('src/flows/test1.flow', content.src)).to.deep.equal({});
  });

  it('should handle obsolete flows', async () => {
    const handler = new Handler();
    const content = getContentObsolete();
    expect(await handler.compare('src/flows/test1.flow', content.src, 'org/flows/test1.flow', content.org)).to.be.false;
    expect(await handler.addFiles('src/flows/test1.flow', content.src)).to.deep.equal([
      {
        content: `<?xml version="1.0" encoding="UTF-8"?>
<FlowDefinition xmlns="http://soap.sforce.com/2006/04/metadata">
    <activeVersionNumber>0</activeVersionNumber>
</FlowDefinition>`,
        path: 'flowDefinitions/test1.flowDefinition',
      },
    ]);
    expect(await handler.addToPackageXml('src/flows/test1.flow', content.src)).to.deep.equal({
      FlowDefinition: ['test1'],
    });
  });
});

function getContentUnchanged() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>52.0</apiVersion>
    <start>
        <object>Account</object>
        <recordTriggerType>CreateAndUpdate</recordTriggerType>
    </start>
    <status>Active</status>
</Flow>`,
    src: `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>52.0</apiVersion>
    <start>
        <object>Account</object>
        <recordTriggerType>CreateAndUpdate</recordTriggerType>
    </start>
    <status>Active</status>
</Flow>`,
  };
}

function getContentChanged() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>52.0</apiVersion>
    <start>
        <object>Account</object>
        <recordTriggerType>CreateAndUpdate</recordTriggerType>
    </start>
    <status>Active</status>
</Flow>`,
    src: `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>52.0</apiVersion>
    <start>
        <object>Account</object>
        <recordTriggerType>CreateAndUpdate</recordTriggerType>
    </start>
    <status>Draft</status>
</Flow>`,
  };
}

function getContentObsolete() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>52.0</apiVersion>
    <start>
        <object>Account</object>
        <recordTriggerType>CreateAndUpdate</recordTriggerType>
    </start>
    <status>Active</status>
</Flow>`,
    src: `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>52.0</apiVersion>
    <start>
        <object>Account</object>
        <recordTriggerType>CreateAndUpdate</recordTriggerType>
    </start>
    <status>Obsolete</status>
</Flow>`,
  };
}
