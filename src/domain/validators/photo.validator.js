const Ajv = require('ajv');
const createSchema = require('../dtos/create-photo.dto');

class PhotoValidator {
  constructor() {
    // Inițializează Ajv pentru validarea JSON, cu suport pentru formatul `uri`
    const ajv = new Ajv({ formats: { uri: true } });
    // Compilează schema pentru validarea datelor la crearea unei fotografii
    this.validateCreate = ajv.compile(createSchema);
  }

  /**
   * Validează datele pentru crearea unei fotografii noi.
   * Utilizează schema JSON definită în `create-photo.dto`.
   * Dacă datele sunt invalide, returnează un răspuns HTTP 400 cu detaliile erorilor.
   * @param {Object} req - Obiectul cererii HTTP (conține datele fotografiei).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru continuarea execuției.
   */
  validateCreatePhoto(req, res, next) {
    // Validează datele din `req.body` folosind schema JSON
    if (!this.validateCreate(req.body)) {
      return res.status(400).json({ errors: this.validateCreate.errors });
    }
    // Continuă execuția dacă datele sunt valide
    next();
  }
}

module.exports = new PhotoValidator();
