/**
 * Compare Controller
 */

const CompareService = require('../services/compare/compareService');

class CompareController {
  static async compareMetadata(req, res, next) {
    try {
      const { sourceMetadata, targetMetadata } = req.body;
      
      const result = CompareService.compareMetadata(sourceMetadata, targetMetadata);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async compareSObjects(req, res, next) {
    try {
      const { sourceObjects, targetObjects } = req.body;
      
      const result = CompareService.compareSObjects(sourceObjects, targetObjects);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async compareComponents(req, res, next) {
    try {
      const { sourceComponents, targetComponents } = req.body;
      
      const differences = CompareService.compareMetadata(
        sourceComponents,
        targetComponents
      );
      
      res.json(differences);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CompareController;
