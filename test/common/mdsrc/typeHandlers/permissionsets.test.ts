import { expect } from 'chai';
import Handler from '../../../../src/common/mdsrc/typeHandlers/permissionsets.js';

describe('compare assignment rules', () => {
  it('should detect changes in permission sets', async () => {
    const handler = new Handler();
    const content = getChangedContent();
    expect(
      await handler.compare(
        'src/permissionsets/Modified.permissionset',
        content.src,
        'org/permissionsets/Modified.permissionset',
        content.org
      )
    ).to.be.false;
  });
  it('should detect if content matches', async () => {
    const handler = new Handler();
    const content = getChangedContent();

    expect(
      await handler.compare(
        'src/permissionsets/Modified.permissionset',
        content.src,
        'org/permissionsets/Modified.permissionset',
        content.src
      )
    ).to.be.true;
  });
  it('should determine changes between perm sets', async () => {
    const handler = new Handler();
    const content = getChangedContent();
    const changes = await handler.getChanges(content.src, content.org);
    expect(changes).to.deep.equal(content.expectedChanges);
  });
});

function getChangedContent() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <fieldPermissions>
        <editable>false</editable>
        <field>Account.Field1__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Account.Field2__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Account.Field3__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Account.Field4__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Contact.Field1__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Contact.Field2__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Contact.Field3__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Contact.Field4__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <hasActivationRequired>false</hasActivationRequired>
    <label>Test Perm Set</label>
    <objectPermissions>
        <allowCreate>false</allowCreate>
        <allowDelete>false</allowDelete>
        <allowEdit>false</allowEdit>
        <allowRead>true</allowRead>
        <modifyAllRecords>false</modifyAllRecords>
        <object>Account</object>
        <viewAllRecords>false</viewAllRecords>
    </objectPermissions>
    <objectPermissions>
        <allowCreate>false</allowCreate>
        <allowDelete>false</allowDelete>
        <allowEdit>false</allowEdit>
        <allowRead>true</allowRead>
        <modifyAllRecords>false</modifyAllRecords>
        <object>Contct</object>
        <viewAllRecords>false</viewAllRecords>
    </objectPermissions>
</PermissionSet>`,
    src: `<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <fieldPermissions>
        <editable>false</editable>
        <field>Account.Field1__c</field>
        <readable>true</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Account.Field2__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>true</editable>
        <field>Account.Field3__c</field>
        <readable>true</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Account.Field4__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Contact.Field1__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Contact.Field2__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Contact.Field3__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <fieldPermissions>
        <editable>false</editable>
        <field>Contact.Field4__c</field>
        <readable>false</readable>
    </fieldPermissions>
    <hasActivationRequired>false</hasActivationRequired>
    <label>Test Perm Set</label>
    <objectPermissions>
        <allowCreate>false</allowCreate>
        <allowDelete>false</allowDelete>
        <allowEdit>false</allowEdit>
        <allowRead>true</allowRead>
        <modifyAllRecords>false</modifyAllRecords>
        <object>Account</object>
        <viewAllRecords>false</viewAllRecords>
    </objectPermissions>
    <objectPermissions>
        <allowCreate>false</allowCreate>
        <allowDelete>false</allowDelete>
        <allowEdit>false</allowEdit>
        <allowRead>true</allowRead>
        <modifyAllRecords>false</modifyAllRecords>
        <object>Contct</object>
        <viewAllRecords>false</viewAllRecords>
    </objectPermissions>
</PermissionSet>`,
    expectedChanges: {
      PermissionSet: {
        $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
        fieldPermissions: [
          { editable: ['false'], field: ['Account.Field1__c'], readable: ['true'] },
          { editable: ['true'], field: ['Account.Field3__c'], readable: ['true'] },
        ],
        hasActivationRequired: ['false'],
        label: ['Test Perm Set'],
      },
    },
  };
}
