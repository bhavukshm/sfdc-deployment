/**
 * SOAP Helper Functions
 * Build and parse SOAP envelopes for SF APIs
 */

const xml2js = require('xml2js');

/**
 * Build SOAP envelope
 * @param {string} body - SOAP body content
 * @param {string} sessionId - Session ID
 * @param {string} apiType - 'metadata' or 'partner'
 * @returns {string} Complete SOAP envelope
 */
function buildSOAPEnvelope(body, sessionId, apiType = 'metadata') {
  const namespace = apiType === 'metadata' ? 'met' : 'urn';
  const nsUrl = apiType === 'metadata' 
    ? 'http://soap.sforce.com/2006/04/metadata'
    : 'urn:partner.soap.sforce.com';

  const sessionHeader = sessionId ? `
    <soapenv:Header>
      <${namespace}:SessionHeader>
        <${namespace}:sessionId>${sessionId}</${namespace}:sessionId>
      </${namespace}:SessionHeader>
    </soapenv:Header>` : '';

  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope 
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
  xmlns:${namespace}="${nsUrl}"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  ${sessionHeader}
  <soapenv:Body>
    ${body}
  </soapenv:Body>
</soapenv:Envelope>`;
}

/**
 * Parse SOAP response
 */
async function parseSOAPResponse(xmlResponse) {
  const parser = new xml2js.Parser({
    explicitArray: false,
    ignoreAttrs: true,
    tagNameProcessors: [xml2js.processors.stripPrefix]
  });
  
  const result = await parser.parseStringPromise(xmlResponse);
  const body = result.Envelope.Body;
  
  // Extract result from body
  const resultKey = Object.keys(body).find(key => key.includes('Response'));
  if (resultKey) {
    const response = body[resultKey];
    const dataKey = Object.keys(response).find(key => key.includes('result'));
    return response[dataKey] || response;
  }
  
  return body;
}

/**
 * Build package.xml
 */
function buildPackageXML(types, apiVersion = '59.0') {
  let typesXml = '';
  types.forEach(type => {
    typesXml += '  <types>\n';
    type.members.forEach(member => {
      typesXml += `    <members>${member}</members>\n`;
    });
    typesXml += `    <name>${type.name}</name>\n  </types>\n`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
${typesXml}  <version>${apiVersion}</version>
</Package>`;
}

module.exports = { buildSOAPEnvelope, parseSOAPResponse, buildPackageXML };
