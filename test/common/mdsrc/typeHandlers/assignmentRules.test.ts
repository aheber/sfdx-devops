import { expect } from 'chai';
import Handler from '../../../../src/common/mdsrc/typeHandlers/assignmentRules.js';

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
    org: `<AssignmentRules xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <assignmentRule>
        <fullName>deleted</fullName>
        <active>false</active>
        <ruleEntry>
            <assignedTo>testUser@org.com</assignedTo>
            <assignedToType>User</assignedToType>
            <criteriaItems>
                <field>Case.IsEscalated</field>
                <operation>equals</operation>
                <value>True</value>
            </criteriaItems>
            <template>emailtemplate</template>
        </ruleEntry>
    </assignmentRule>
    <assignmentRule>
        <fullName>changed</fullName>
        <active>false</active>
        <ruleEntry>
            <assignedTo>otherUserOldEmail@org.com</assignedTo>
            <assignedToType>User</assignedToType>
            <criteriaItems>
                <field>Case.IsEscalated</field>
                <operation>equals</operation>
                <value>False</value>
            </criteriaItems>
            <template>emailtemplate</template>
        </ruleEntry>
    </assignmentRule>
    <assignmentRule>
        <fullName>unchanged</fullName>
        <active>false</active>
        <ruleEntry>
            <assignedTo>otherUser@org.com</assignedTo>
            <assignedToType>User</assignedToType>
            <criteriaItems>
                <field>Case.IsEscalated</field>
                <operation>equals</operation>
                <value>False</value>
            </criteriaItems>
            <template>emailtemplate</template>
        </ruleEntry>
    </assignmentRule>
</AssignmentRules>`,
    src: `<AssignmentRules xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <assignmentRule>
        <fullName>new</fullName>
        <active>false</active>
        <ruleEntry>
            <assignedTo>otherUser@org.com</assignedTo>
            <assignedToType>User</assignedToType>
            <criteriaItems>
                <field>Case.IsEscalated</field>
                <operation>equals</operation>
                <value>False</value>
            </criteriaItems>
            <template>emailtemplate</template>
        </ruleEntry>
    </assignmentRule>
    <assignmentRule>
        <fullName>changed</fullName>
        <active>false</active>
        <ruleEntry>
            <assignedTo>otherUser@org.com</assignedTo>
            <assignedToType>User</assignedToType>
            <criteriaItems>
                <field>Case.IsEscalated</field>
                <operation>equals</operation>
                <value>False</value>
            </criteriaItems>
            <template>emailtemplate</template>
        </ruleEntry>
    </assignmentRule>
    <assignmentRule>
        <fullName>unchanged</fullName>
        <active>false</active>
        <ruleEntry>
            <assignedTo>otherUser@org.com</assignedTo>
            <assignedToType>User</assignedToType>
            <criteriaItems>
                <field>Case.IsEscalated</field>
                <operation>equals</operation>
                <value>False</value>
            </criteriaItems>
            <template>emailtemplate</template>
        </ruleEntry>
    </assignmentRule>
</AssignmentRules>`,
    expectedBuild: `<?xml version="1.0" encoding="UTF-8"?>
<AssignmentRules xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <assignmentRule>
    <fullName>new</fullName>
    <active>false</active>
    <ruleEntry>
      <assignedTo>otherUser@org.com</assignedTo>
      <assignedToType>User</assignedToType>
      <criteriaItems>
        <field>Case.IsEscalated</field>
        <operation>equals</operation>
        <value>False</value>
      </criteriaItems>
      <template>emailtemplate</template>
    </ruleEntry>
  </assignmentRule>
  <assignmentRule>
    <fullName>changed</fullName>
    <active>false</active>
    <ruleEntry>
      <assignedTo>otherUser@org.com</assignedTo>
      <assignedToType>User</assignedToType>
      <criteriaItems>
        <field>Case.IsEscalated</field>
        <operation>equals</operation>
        <value>False</value>
      </criteriaItems>
      <template>emailtemplate</template>
    </ruleEntry>
  </assignmentRule>
</AssignmentRules>`,
    expectedChanges: {
      AssignmentRules: {
        $: {
          xmlns: 'http://soap.sforce.com/2006/04/metadata',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        },
        assignmentRule: [
          {
            active: ['false'],
            fullName: ['new'],
            ruleEntry: [
              {
                assignedTo: ['otherUser@org.com'],
                assignedToType: ['User'],
                criteriaItems: [
                  {
                    field: ['Case.IsEscalated'],
                    operation: ['equals'],
                    value: ['False'],
                  },
                ],
                template: ['emailtemplate'],
              },
            ],
          },
          {
            active: ['false'],
            fullName: ['changed'],
            ruleEntry: [
              {
                assignedTo: ['otherUser@org.com'],
                assignedToType: ['User'],
                criteriaItems: [
                  {
                    field: ['Case.IsEscalated'],
                    operation: ['equals'],
                    value: ['False'],
                  },
                ],
                template: ['emailtemplate'],
              },
            ],
          },
        ],
      },
    },
  };
}
