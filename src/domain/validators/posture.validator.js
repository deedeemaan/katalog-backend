const Ajv = require('ajv');
const schema = require('../dtos/create-posture.dto');

class PostureValidator {
  constructor() {
    const ajv = new Ajv();
    this.validateCreate = ajv.compile(schema);
  }

  validateCreatePosture(req, res, next) {
    if (!this.validateCreate(req.body)) {
      return res.status(400).json({ errors: this.validateCreate.errors });
    }
    next();
  }

  validateAnalyzePosture(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid photo id' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    next();
  }
}

module.exports = new PostureValidator();
