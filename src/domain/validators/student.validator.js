const Ajv = require('ajv');
const createSchema = require('../dtos/create-student.dto');
const updateSchema = require('../dtos/update-student.dto');

class StudentValidator {
  constructor() {
    const ajv = new Ajv();
    this.validateCreate = ajv.compile(createSchema);
    this.validateUpdate = ajv.compile(updateSchema);
    console.log('validateCreate:', this.validateCreate);
  }

  validateCreateStudent(req, res, next) {
    if (!this.validateCreate(req.body)) {
      return res.status(400).json({ errors: this.validateCreate.errors });
    }
    next();
  }

  validateUpdateStudent(req, res, next) {
    if (!this.validateUpdate(req.body)) {
      return res.status(400).json({ errors: this.validateUpdate.errors });
    }
    next();
  }
}

module.exports = new StudentValidator();
