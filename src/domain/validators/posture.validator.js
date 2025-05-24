const Ajv = require('ajv');
const schema = require('../dtos/create-posture.dto');
const ajv = new Ajv();
const validate = ajv.compile(schema);

exports.validateCreatePosture = (req, res, next) => {
  if (!validate(req.body)) {
    return res.status(400).json({ errors: validate.errors });
  }
  next();
};
// domain/validators/analyzePosture.validator.js
exports.validateAnalyzePosture = (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid photo id' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  next();
};
