import { expect } from 'chai';
import Handler from '../../../../src/common/mdsrc/typeHandlers/classes.js';

describe('compare apex classes', () => {
  it('should see identical Apex as same', async () => {
    const handler = new Handler();
    const content = getContentSame();
    expect(await handler.compare('source/path/NewClass.cls', content.src, 'org/path/NewClass.cls', content.org)).to.be
      .true;
  });

  it('should see changed a method name as different', async () => {
    const handler = new Handler();
    const content = getContentChanged();
    expect(await handler.compare('source/path/NewClass.cls', content.src, 'org/path/NewClass.cls', content.org)).to.be
      .false;
  });

  it('should see modified whitespace as same', async () => {
    const handler = new Handler();
    const content = getContentChangedWhitespace();
    expect(await handler.compare('source/path/NewClass.cls', content.src, 'org/path/NewClass.cls', content.org)).to.be
      .false;
  });

  it('should see unchanged Xml as same', async () => {
    const handler = new Handler();
    const content = getXmlIdentical();
    expect(
      await handler.compare(
        'source/path/NewClass.cls-meta.xml',
        content.src,
        'org/path/NewClass.cls-meta.xml',
        content.org
      )
    ).to.be.true;
  });

  it('should see whitespace only changes as same', async () => {
    const handler = new Handler();
    const content = getXmlWhitespaceDifferent();
    expect(
      await handler.compare(
        'source/path/NewClass.cls-meta.xml',
        content.src,
        'org/path/NewClass.cls-meta.xml',
        content.org
      )
    ).to.be.true;
  });

  it('should see changed API version as different', async () => {
    const handler = new Handler();
    const content = getXmlChangedApiVersion();
    expect(
      await handler.compare(
        'source/path/NewClass.cls-meta.xml',
        content.src,
        'org/path/NewClass.cls-meta.xml',
        content.org
      )
    ).to.be.false;
  });
});

function getContentSame() {
  return {
    org: `public class NewClass {
    public Boolean method1(String param1) {
        if(String.isBlank(param1)){
            return true;
        }
        return false;
    }
}`,
    src: `public class NewClass {
    public Boolean method1(String param1) {
        if(String.isBlank(param1)){
            return true;
        }
        return false;
    }
}`,
  };
}

function getContentChanged() {
  return {
    org: `public class NewClass {
    public Boolean method1(String param1) {
        if(String.isBlank(param1)){
            return true;
        }
        return false;
    }
}`,
    src: `public class NewClass {
    public Boolean methodUpdated(String param1) {
        if(String.isBlank(param1)){
            return true;
        }
        return false;
    }
}`,
  };
}

function getContentChangedWhitespace() {
  return {
    org: `public class NewClass {
    public Boolean method1(String param1) {
        if(String.isBlank(param1)){
            return true;
        }
        return false;
    }
}`,
    src: `public class NewClass {
    public Boolean method1(String param1)

    {
        if(String.isBlank(param1)){


            return true;
        }
        return false  ;
    }
}
`,
  };
}

function getXmlIdentical() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8" ?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <status>Active</status>
    <apiVersion>47.0</apiVersion>
</ApexClass>`,
    src: `<?xml version="1.0" encoding="UTF-8" ?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <status>Active</status>
    <apiVersion>47.0</apiVersion>
</ApexClass>`,
  };
}

function getXmlWhitespaceDifferent() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8" ?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <status>Active</status>
    <apiVersion>47.0</apiVersion>
</ApexClass>`,
    src: `<?xml version="1.0" encoding="UTF-8" ?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <status

    >Active</status>

    <apiVersion>47.0</apiVersion>
</ApexClass>`,
  };
}

function getXmlChangedApiVersion() {
  return {
    org: `<?xml version="1.0" encoding="UTF-8" ?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <status>Active</status>
    <apiVersion>47.0</apiVersion>
</ApexClass>`,
    src: `<?xml version="1.0" encoding="UTF-8" ?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <status>Active</status>
    <apiVersion>60.0</apiVersion>
</ApexClass>`,
  };
}
