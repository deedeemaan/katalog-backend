const Ajv = require('ajv');
const createSchema = require('../dtos/create-photo.dto');

class PhotoValidator {
  constructor() {
    const ajv = new Ajv({ formats: { uri: true } });
    this.validateCreate = ajv.compile(createSchema);
  }

  validateCreatePhoto(req, res, next) {
    if (!this.validateCreate(req.body)) {
      return res.status(400).json({ errors: this.validateCreate.errors });
    }
    next();
  }
}

module.exports = new PhotoValidator();
