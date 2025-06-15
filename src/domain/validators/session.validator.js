const Ajv = require('ajv');
const createSchema = require('../dtos/create-session.dto');
const updateSchema = require('../dtos/update-session.dto');

class SessionValidator {
  constructor() {
    // Inițializează Ajv pentru validarea JSON, cu suport pentru formatul `date`
    const ajv = new Ajv({ formats: { date: /^\d{4}-\d{2}-\d{2}$/ } });
    // Compilează schema pentru validarea datelor la crearea unei sesiuni
    this.validateCreate = ajv.compile(createSchema);
    // Compilează schema pentru validarea datelor la actualizarea unei sesiuni
    this.validateUpdate = ajv.compile(updateSchema);
  }

  /**
   * Validează datele pentru crearea unei sesiuni noi.
   * Utilizează schema JSON definită în `create-session.dto`.
   * Dacă datele sunt invalide, returnează un răspuns HTTP 400 cu detaliile erorilor.
   * @param {Object} req - Obiectul cererii HTTP (conține datele sesiunii).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru continuarea execuției.
   */
  validateCreateSession(req, res, next) {
    if (!this.validateCreate(req.body)) {
      return res.status(400).json({ errors: this.validateCreate.errors });
    }
    next();
  }

  /**
   * Validează datele pentru actualizarea unei sesiuni existente.
   * Verifică dacă `session_date` este o dată validă și dacă `session_type` este unul dintre tipurile permise.
   * Dacă datele sunt invalide, returnează un răspuns HTTP 400 cu detaliile erorilor.
   * @param {Object} req - Obiectul cererii HTTP (conține datele actualizate ale sesiunii).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru continuarea execuției.
   */
  validateUpdateSession(req, res, next) {
    const { session_date, session_type } = req.body;

    // Verifică dacă `session_date` este o dată validă
    const parsedDate = new Date(session_date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid session_date: must be a valid date in YYYY-MM-DD format' });
    }

    // Normalizează `session_date` în formatul corect
    req.body.session_date = session_date;

    // Verifică dacă `session_type` este unul dintre tipurile permise
    const validSessionTypes = ['corectie', 'evaluare', 'consolidare'];
    if (!validSessionTypes.includes(session_type)) {
      return res.status(400).json({ error: 'Invalid session_type: must be one of corectie, evaluare, consolidare' });
    }

    // Continuă execuția dacă datele sunt valide
    next();
  }
}

module.exports = new SessionValidator();
