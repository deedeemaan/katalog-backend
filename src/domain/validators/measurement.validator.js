const Ajv = require('ajv');
const createSchema = require('../dtos/create-measurement.dto');
const updateSchema = require('../dtos/update-measurement.dto');

class MeasurementValidator {
  constructor() {
    const ajv = new Ajv();
    this.validateCreate = ajv.compile(createSchema);
    this.validateUpdate = ajv.compile(updateSchema);
  }

  validateCreateMeasurement(req, res, next) {
    if (!this.validateCreate(req.body)) {
      return res.status(400).json({ errors: this.validateCreate.errors });
    }
    next();
  }

  validateUpdateMeasurement(req, res, next) {
    const { student_id } = req.body;
    console.log('Validator student_id:', student_id);

    if (typeof student_id !== 'number') {
      const parsedId = Number(student_id);
      if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'Invalid student_id: must be a number' });
      }
      req.body.student_id = parsedId;
    }
    if (!this.validateUpdate(req.body)) {
      return res.status(400).json({ errors: this.validateUpdate.errors });
    }
    next();
  }
}

module.exports = new MeasurementValidator();
