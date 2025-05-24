const Ajv = require('ajv');
const createSchema = require('../dtos/create-measurement.dto');
const updateSchema = require('../dtos/update-measurement.dto');

const ajv = new Ajv();
const validateCreate = ajv.compile(createSchema);
const validateUpdate = ajv.compile(updateSchema);

exports.validateCreateMeasurement = (req, res, next) => {
  if (!validateCreate(req.body)) {
    return res.status(400).json({ errors: validateCreate.errors });
  }
  next();
};

exports.validateUpdateMeasurement = (req, res, next) => {
  if (!validateUpdate(req.body)) {
    return res.status(400).json({ errors: validateUpdate.errors });
  }
  next();
};
