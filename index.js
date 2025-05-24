const express = require('express');
const cors = require('cors');
const studentCtrl = require('./src/controllers/student.controller');
const measCtrl    = require('./src/controllers/measurement.controller');
const sessCtrl    = require('./src/controllers/session.controller');
const photoCtrl   = require('./src/controllers/photo.controller');
const postureCtrl = require('./src/controllers/posture.controller');


const app = express();
app.use(cors());
app.use(express.json());

// Montează controllerul pe /students
app.use('/students', studentCtrl);        // GET /students, GET /students/:id, POST /students etc.
app.use('/measurements', measCtrl);       // POST /measurements, GET /measurements/:id etc.
app.use('/sessions', sessCtrl);           // POST /sessions, GET /sessions/:id etc.
app.use('/photos', photoCtrl);            // POST /photos, POST /photos/upload, GET /photos/:id etc.
app.use('/posture', postureCtrl);         // POST /posture/analyze etc.

// serve static uploads
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
