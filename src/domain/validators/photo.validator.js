const Ajv = require('ajv');
const createSchema = require('../dtos/create-photo.dto');
const ajv = new Ajv({formats:{uri: true}});
const validateCreate = ajv.compile(createSchema);

exports.validateCreatePhoto = (req, res, next) => {
  if (!validateCreate(req.body)) {
    return res.status(400).json({ errors: validateCreate.errors });
  }
  next();
};
