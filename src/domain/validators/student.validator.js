const Ajv = require('ajv');
const createSchema = require('../dtos/create-student.dto');
const updateSchema = require('../dtos/update-student.dto');

class StudentValidator {
  constructor() {
    // Inițializează Ajv pentru validarea JSON
    const ajv = new Ajv();
    // Compilează schema pentru validarea datelor la crearea unui student
    this.validateCreate = ajv.compile(createSchema);
    // Compilează schema pentru validarea datelor la actualizarea unui student
    this.validateUpdate = ajv.compile(updateSchema);
    console.log('validateCreate:', this.validateCreate); // Log pentru debugging
  }

  /**
   * Validează datele pentru crearea unui student nou.
   * Utilizează schema JSON definită în `create-student.dto`.
   * Dacă datele sunt invalide, returnează un răspuns HTTP 400 cu detaliile erorilor.
   * @param {Object} req - Obiectul cererii HTTP (conține datele studentului).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru continuarea execuției.
   */
  validateCreateStudent(req, res, next) {
    if (!this.validateCreate(req.body)) {
      return res.status(400).json({ errors: this.validateCreate.errors });
    }
    next();
  }

  /**
   * Validează datele pentru actualizarea unui student existent.
   * Utilizează schema JSON definită în `update-student.dto`.
   * Dacă datele sunt invalide, returnează un răspuns HTTP 400 cu detaliile erorilor.
   * @param {Object} req - Obiectul cererii HTTP (conține datele actualizate ale studentului).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru continuarea execuției.
   */
  validateUpdateStudent(req, res, next) {
    if (!this.validateUpdate(req.body)) {
      return res.status(400).json({ errors: this.validateUpdate.errors });
    }
    next();
  }
}

module.exports = new StudentValidator();
