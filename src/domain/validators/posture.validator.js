const Ajv = require('ajv');
const schema = require('../dtos/create-posture.dto');

class PostureValidator {
  constructor() {
    // Inițializează Ajv pentru validarea JSON
    const ajv = new Ajv();
    // Compilează schema pentru validarea datelor la crearea unei posturi
    this.validateCreate = ajv.compile(schema);
  }

  /**
   * Validează datele pentru crearea unei posturi noi.
   * Utilizează schema JSON definită în `create-posture.dto`.
   * Dacă datele sunt invalide, returnează un răspuns HTTP 400 cu detaliile erorilor.
   * @param {Object} req - Obiectul cererii HTTP (conține datele posturii).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru continuarea execuției.
   */
  validateCreatePosture(req, res, next) {
    // Validează datele din `req.body` folosind schema JSON
    if (!this.validateCreate(req.body)) {
      return res.status(400).json({ errors: this.validateCreate.errors });
    }
    // Continuă execuția dacă datele sunt valide
    next();
  }

  /**
   * Validează datele pentru analiza unei posturi.
   * Verifică dacă `id` este un număr valid și dacă fișierul imagine a fost încărcat.
   * Dacă datele sunt invalide, returnează un răspuns HTTP 400 cu detaliile erorilor.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul fotografiei și fișierul imagine).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru continuarea execuției.
   */
  validateAnalyzePosture(req, res, next) {
    // Verifică dacă `id` este un număr valid
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid photo id' });
    }

    // Verifică dacă fișierul imagine a fost încărcat
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Continuă execuția dacă datele sunt valide
    next();
  }
}

module.exports = new PostureValidator();
