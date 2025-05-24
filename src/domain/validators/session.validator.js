const Ajv = require('ajv');
const createSchema = require('../dtos/create-session.dto');
const updateSchema = require('../dtos/update-session.dto');
const ajv = new Ajv({formats: {date: /^\d{4}-\d{2}-\d{2}$/}});
const validateCreate = ajv.compile(createSchema);
const validateUpdate = ajv.compile(updateSchema);

exports.validateCreateSession = (req, res, next) => {
  if (!validateCreate(req.body)) {
    return res.status(400).json({ errors: validateCreate.errors });
  }
  next();
};

exports.validateUpdateSession = (req, res, next) => {
  if (!validateUpdate(req.body)) {
    return res.status(400).json({ errors: validateUpdate.errors });
  }
  next();
};
