/**
 * Diff Utilities
 * Compare XML and JSON objects
 */

/**
 * Compare two XML strings
 */
function diffXML(xml1, xml2) {
  // Normalize whitespace
  const normalize = xml => xml.replace(/\s+/g, ' ').trim();
  
  const normalized1 = normalize(xml1);
  const normalized2 = normalize(xml2);

  return {
    hasChanges: normalized1 !== normalized2,
    source: xml1,
    target: xml2,
    type: 'xml'
  };
}

/**
 * Compare two JSON objects
 */
function diffJSON(obj1, obj2) {
  const changes = [];
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  allKeys.forEach(key => {
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      changes.push({ key, source: val1, target: val2 });
    }
  });

  return {
    hasChanges: changes.length > 0,
    changes,
    type: 'json'
  };
}

/**
 * Create unified diff format
 */
function createUnifiedDiff(source, target, context = 3) {
  const sourceLines = source.split('\n');
  const targetLines = target.split('\n');
  const diff = [];

  // Simple line-by-line comparison
  const maxLen = Math.max(sourceLines.length, targetLines.length);
  
  for (let i = 0; i < maxLen; i++) {
    const sourceLine = sourceLines[i];
    const targetLine = targetLines[i];

    if (sourceLine !== targetLine) {
      if (sourceLine !== undefined) diff.push(`- ${sourceLine}`);
      if (targetLine !== undefined) diff.push(`+ ${targetLine}`);
    } else {
      diff.push(`  ${sourceLine}`);
    }
  }

  return diff.join('\n');
}

module.exports = { diffXML, diffJSON, createUnifiedDiff };
