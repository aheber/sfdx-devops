import { expect } from 'chai';
import Handler from '../../../../src/common/mdsrc/typeHandlers/queues.js';

describe('compare queues', () => {
  it('should successfully compare identical content', async () => {
    const handler = new Handler();
    const content = getChangedAssignments();
    expect(await handler.compare('src/queues/Modified.queue', content.src, 'org/queues/Modified.queue', content.src)).to
      .be.true;
  });
  it('should successfully compare member-only changes', async () => {
    const handler = new Handler();
    const content = getChangedAssignments();
    expect(await handler.compare('src/queues/Modified.queue', content.src, 'org/queues/Modified.queue', content.org)).to
      .be.true;
  });
  it('should detect meaningful changes', async () => {
    const handler = new Handler();
    const content = getChangedMainContent();
    expect(await handler.compare('src/queues/Modified.queue', content.src, 'org/queues/Modified.queue', content.org)).to
      .be.false;
  });
});

function getChangedAssignments() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8" ?>
<Queue xmlns="http://soap.sforce.com/2006/04/metadata">
    <doesSendEmailToMembers>true</doesSendEmailToMembers>
    <queueMembers>
        <publicGroups>
            <publicGroup>Test_Group</publicGroup>
        </publicGroups>
    </queueMembers>
    <name>testMembers</name>
    <queueSobject>
        <sobjectType>Case</sobjectType>
    </queueSobject>
</Queue>`,
    src: `<?xml version="1.0" encoding="UTF-8" ?>
<Queue xmlns="http://soap.sforce.com/2006/04/metadata">
    <doesSendEmailToMembers>true</doesSendEmailToMembers>
    <name>testMembers</name>
    <queueSobject>
        <sobjectType>Case</sobjectType>
    </queueSobject>
</Queue>`,
  };
}

function getChangedMainContent() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8" ?>
<Queue xmlns="http://soap.sforce.com/2006/04/metadata">
    <doesSendEmailToMembers>true</doesSendEmailToMembers>
    <name>AU/NZ BA</name>
    <queueSobject>
        <sobjectType>Case</sobjectType>
    </queueSobject>
</Queue>`,
    src: `<?xml version="1.0" encoding="UTF-8" ?>
<Queue xmlns="http://soap.sforce.com/2006/04/metadata">
    <doesSendEmailToMembers>true</doesSendEmailToMembers>
    <name>AU/NZ BA</name>
    <queueSobject>
        <sobjectType>Lead</sobjectType>
    </queueSobject>
</Queue>`,
  };
}
