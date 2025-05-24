const Ajv = require('ajv');
const createSchema = require('../dtos/create-student.dto');
const updateSchema = require('../dtos/update-student.dto');

const ajv = new Ajv();
const createValidator = ajv.compile(createSchema);
const updateValidator = ajv.compile(updateSchema);

exports.validateCreateStudent = (req, res, next) => {
  if (!createValidator(req.body)) {
    return res.status(400).json({ errors: createValidator.errors });
  }
  next();
};

exports.validateUpdateStudent = (req, res, next) => {
  if (!updateValidator(req.body)) {
    return res.status(400).json({ errors: updateValidator.errors });
  }
  next();
};
