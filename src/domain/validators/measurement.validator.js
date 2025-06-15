const Ajv = require('ajv');
const createSchema = require('../dtos/create-measurement.dto');
const updateSchema = require('../dtos/update-measurement.dto');

class MeasurementValidator {
  constructor() {
    const ajv = new Ajv();
    // Compilează schema pentru validarea măsurătorilor la creare
    this.validateCreate = ajv.compile(createSchema);
    // Compilează schema pentru validarea măsurătorilor la actualizare
    this.validateUpdate = ajv.compile(updateSchema);
  }

  /**
   * Validează datele pentru crearea unei măsurători noi.
   * Utilizează schema JSON definită în `create-measurement.dto`.
   * Dacă datele sunt invalide, returnează un răspuns HTTP 400 cu detaliile erorilor.
   * @param {Object} req - Obiectul cererii HTTP (conține datele măsurătorii).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru continuarea execuției.
   */
  validateCreateMeasurement(req, res, next) {
    if (!this.validateCreate(req.body)) {
      return res.status(400).json({ errors: this.validateCreate.errors });
    }
    next();
  }

  /**
   * Validează datele pentru actualizarea unei măsurători existente.
   * Verifică dacă `student_id` este un număr valid și îl convertește dacă este transmis ca string.
   * Utilizează schema JSON definită în `update-measurement.dto`.
   * Dacă datele sunt invalide, returnează un răspuns HTTP 400 cu detaliile erorilor.
   * @param {Object} req - Obiectul cererii HTTP (conține datele actualizate ale măsurătorii).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru continuarea execuției.
   */
  validateUpdateMeasurement(req, res, next) {
    const { student_id } = req.body;
    console.log('Validator student_id:', student_id);

    // Verifică dacă `student_id` este un număr valid
    if (typeof student_id !== 'number') {
      const parsedId = Number(student_id);
      if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'Invalid student_id: must be a number' });
      }
      req.body.student_id = parsedId; // Convertește `student_id` în număr
    }

    // Validează datele folosind schema JSON
    if (!this.validateUpdate(req.body)) {
      return res.status(400).json({ errors: this.validateUpdate.errors });
    }
    next();
  }
}

module.exports = new MeasurementValidator();
