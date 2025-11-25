/**
 * Org Comparison Service
 * 
 * Compares metadata between two Salesforce orgs
 * Identifies differences in components, fields, configurations
 */

const { logger } = require('../../utils/logger');
const { diffXML, diffJSON } = require('../../utils/diffHelper');

class CompareService {
  /**
   * Compare metadata between two orgs
   * @param {Object} sourceMetadata - Source org metadata
   * @param {Object} targetMetadata - Target org metadata
   * @returns {Object} Comparison result
   */
  static compareMetadata(sourceMetadata, targetMetadata) {
    const differences = {
      onlyInSource: [],
      onlyInTarget: [],
      modified: [],
      identical: []
    };

    const sourceKeys = new Set(Object.keys(sourceMetadata));
    const targetKeys = new Set(Object.keys(targetMetadata));

    // Find items only in source
    sourceKeys.forEach(key => {
      if (!targetKeys.has(key)) {
        differences.onlyInSource.push({ name: key, data: sourceMetadata[key] });
      }
    });

    // Find items only in target
    targetKeys.forEach(key => {
      if (!sourceKeys.has(key)) {
        differences.onlyInTarget.push({ name: key, data: targetMetadata[key] });
      }
    });

    // Find modified items
    sourceKeys.forEach(key => {
      if (targetKeys.has(key)) {
        const diff = this._compareItems(sourceMetadata[key], targetMetadata[key]);
        if (diff.hasChanges) {
          differences.modified.push({ name: key, diff });
        } else {
          differences.identical.push(key);
        }
      }
    });

    logger.info('Metadata comparison completed', {
      onlyInSource: differences.onlyInSource.length,
      onlyInTarget: differences.onlyInTarget.length,
      modified: differences.modified.length,
      identical: differences.identical.length
    });

    return differences;
  }

  /**
   * Compare two metadata items
   */
  static _compareItems(source, target) {
    if (typeof source === 'string' && typeof target === 'string') {
      return diffXML(source, target);
    }
    return diffJSON(source, target);
  }

  /**
   * Compare SObject schemas
   */
  static compareSObjects(sourceObjects, targetObjects) {
    const results = {
      newObjects: [],
      deletedObjects: [],
      modifiedObjects: []
    };

    const sourceMap = new Map(sourceObjects.map(obj => [obj.name, obj]));
    const targetMap = new Map(targetObjects.map(obj => [obj.name, obj]));

    // Find new and modified objects
    sourceMap.forEach((sourceObj, name) => {
      if (!targetMap.has(name)) {
        results.newObjects.push(sourceObj);
      } else {
        const fieldDiff = this._compareFields(sourceObj.fields, targetMap.get(name).fields);
        if (fieldDiff.hasChanges) {
          results.modifiedObjects.push({ name, ...fieldDiff });
        }
      }
    });

    // Find deleted objects
    targetMap.forEach((targetObj, name) => {
      if (!sourceMap.has(name)) {
        results.deletedObjects.push(targetObj);
      }
    });

    return results;
  }

  /**
   * Compare fields
   */
  static _compareFields(sourceFields, targetFields) {
    const newFields = [];
    const deletedFields = [];
    const modifiedFields = [];

    const sourceFieldMap = new Map(sourceFields.map(f => [f.name, f]));
    const targetFieldMap = new Map(targetFields.map(f => [f.name, f]));

    sourceFieldMap.forEach((sourceFld, name) => {
      if (!targetFieldMap.has(name)) {
        newFields.push(sourceFld);
      } else {
        const targetFld = targetFieldMap.get(name);
        if (JSON.stringify(sourceFld) !== JSON.stringify(targetFld)) {
          modifiedFields.push({ name, source: sourceFld, target: targetFld });
        }
      }
    });

    targetFieldMap.forEach((targetFld, name) => {
      if (!sourceFieldMap.has(name)) {
        deletedFields.push(targetFld);
      }
    });

    return {
      hasChanges: newFields.length > 0 || deletedFields.length > 0 || modifiedFields.length > 0,
      newFields,
      deletedFields,
      modifiedFields
    };
  }
}

module.exports = CompareService;
