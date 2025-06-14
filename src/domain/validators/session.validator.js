const Ajv = require('ajv');
const createSchema = require('../dtos/create-session.dto');
const updateSchema = require('../dtos/update-session.dto');

class SessionValidator {
  constructor() {
    const ajv = new Ajv({ formats: { date: /^\d{4}-\d{2}-\d{2}$/ } });
    this.validateCreate = ajv.compile(createSchema);
    this.validateUpdate = ajv.compile(updateSchema);
  }

  validateCreateSession(req, res, next) {
    if (!this.validateCreate(req.body)) {
      return res.status(400).json({ errors: this.validateCreate.errors });
    }
    next();
  }

  validateUpdateSession(req, res, next) {
    const { session_date, session_type } = req.body;
    const parsedDate = new Date(session_date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid session_date: must be a valid date in YYYY-MM-DD format' });
    }
    req.body.session_date = session_date;
    const validSessionTypes = ['corectie', 'evaluare', 'consolidare'];
    if (!validSessionTypes.includes(session_type)) {
      return res.status(400).json({ error: 'Invalid session_type: must be one of corectie, evaluare, consolidare' });
    }

    next();
  }
}

module.exports = new SessionValidator();
