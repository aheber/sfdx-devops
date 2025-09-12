import { expect } from 'chai';
import Handler from '../../../../src/common/mdsrc/typeHandlers/presenceUserConfigs.js';

describe('compare presence user configs', () => {
  it('should successfully compare identical content', async () => {
    const handler = new Handler();
    const content = getChangedAssignments();
    expect(
      await handler.compare(
        'src/presenceUserConfigs/Modified.presenceUserConfig',
        content.src,
        'org/presenceUserConfigs/Modified.presenceUserConfig',
        content.src
      )
    ).to.be.true;
  });
  it('should successfully compare assignments-only changes', async () => {
    const handler = new Handler();
    const content = getChangedAssignments();
    expect(
      await handler.compare(
        'src/presenceUserConfigs/Modified.presenceUserConfig',
        content.src,
        'org/presenceUserConfigs/Modified.presenceUserConfig',
        content.org
      )
    ).to.be.true;
  });
  it('should detect meaningful changes', async () => {
    const handler = new Handler();
    const content = getChangedMainContent();
    expect(
      await handler.compare(
        'src/presenceUserConfigs/Modified.presenceUserConfig',
        content.src,
        'org/presenceUserConfigs/Modified.presenceUserConfig',
        content.org
      )
    ).to.be.false;
  });
});

function getChangedAssignments() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8"?>
<PresenceUserConfig xmlns="http://soap.sforce.com/2006/04/metadata">
    <assignments>
        <profiles>
            <profile>standard</profile>
        </profiles>
        <users>
            <user>jdoe@example.com</user>
        </users>
    </assignments>
    <capacity>5</capacity>
    <declineReasons>Incorrect_queue</declineReasons>
    <enableAutoAccept>false</enableAutoAccept>
    <enableDecline>true</enableDecline>
    <enableDeclineReason>true</enableDeclineReason>
    <enableDisconnectSound>true</enableDisconnectSound>
    <enableRequestSound>true</enableRequestSound>
    <label>My presence configuration</label>
    <presenceStatusOnDecline>Away</presenceStatusOnDecline>
    <presenceStatusOnPushTimeout>Break</presenceStatusOnPushTimeout>
</PresenceUserConfig>`,
    src: `<?xml version="1.0" encoding="UTF-8"?>
<PresenceUserConfig xmlns="http://soap.sforce.com/2006/04/metadata">
    <assignments>
        <profiles>
        </profiles>
        <users>
            <user>jdoe2@example.com</user>
        </users>
    </assignments>
    <capacity>5</capacity>
    <declineReasons>Incorrect_queue</declineReasons>
    <enableAutoAccept>false</enableAutoAccept>
    <enableDecline>true</enableDecline>
    <enableDeclineReason>true</enableDeclineReason>
    <enableDisconnectSound>true</enableDisconnectSound>
    <enableRequestSound>true</enableRequestSound>
    <label>My presence configuration</label>
    <presenceStatusOnDecline>Away</presenceStatusOnDecline>
    <presenceStatusOnPushTimeout>Break</presenceStatusOnPushTimeout>
</PresenceUserConfig>`,
  };
}

function getChangedMainContent() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8"?>
<PresenceUserConfig xmlns="http://soap.sforce.com/2006/04/metadata">
    <assignments>
        <profiles>
            <profile>standard</profile>
        </profiles>
        <users>
            <user>jdoe@example.com</user>
        </users>
    </assignments>
    <capacity>5</capacity>
    <declineReasons>Incorrect_queue</declineReasons>
    <enableAutoAccept>false</enableAutoAccept>
    <enableDecline>true</enableDecline>
    <enableDeclineReason>true</enableDeclineReason>
    <enableDisconnectSound>true</enableDisconnectSound>
    <enableRequestSound>true</enableRequestSound>
    <label>My presence configuration</label>
    <presenceStatusOnDecline>Away</presenceStatusOnDecline>
    <presenceStatusOnPushTimeout>Break</presenceStatusOnPushTimeout>
</PresenceUserConfig>`,
    src: `<?xml version="1.0" encoding="UTF-8"?>
<PresenceUserConfig xmlns="http://soap.sforce.com/2006/04/metadata">
    <assignments>
        <profiles>
            <profile>standard</profile>
        </profiles>
        <users>
            <user>jdoe@example.com</user>
        </users>
    </assignments>
    <capacity>5</capacity>
    <declineReasons>Incorrect_queue</declineReasons>
    <enableAutoAccept>true</enableAutoAccept>
    <enableDecline>true</enableDecline>
    <enableDeclineReason>true</enableDeclineReason>
    <enableDisconnectSound>true</enableDisconnectSound>
    <enableRequestSound>true</enableRequestSound>
    <label>My presence configuration</label>
    <presenceStatusOnDecline>Away</presenceStatusOnDecline>
    <presenceStatusOnPushTimeout>Break</presenceStatusOnPushTimeout>
</PresenceUserConfig>`,
  };
}
