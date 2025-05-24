// require('dotenv').config();
// const { Client } = require('pg');

// const client = new Client({
//   host: process.env.PGHOST,
//   user: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   database: process.env.PGDATABASE,
//   port: process.env.PGPORT
// });

// client.connect()
//   .then(() => {
//     console.log('✅ Conexiunea la PostgreSQL a reușit!');
//     return client.end();
//   })
//   .catch(err => {
//     console.error('❌ Eroare la conectare:', err.message);
//   });
// // index.js (katalog-backend)
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const path = require('path');

// const pool = require('./db');
// const app = express();
// const PORT = process.env.PORT || 3000;

// const tf = require('@tensorflow/tfjs');
// require('@tensorflow/tfjs-backend-cpu');
// const poseDetection = require('@tensorflow-models/pose-detection');
// const { createCanvas, loadImage } = require('canvas');
// const { drawKeypointsOnImage } = require('./ModelAI');

// app.use(cors());
// app.use(express.json());

// let detector;
// async function getDetector() {
//   if (!detector) {
//     detector = await poseDetection.createDetector(
//       poseDetection.SupportedModels.BlazePose,
//       {
//         runtime: 'tfjs',
//         modelType: 'full',            // 'full' sau 'lite'
//         enableSmoothing: true
//       }
//     );
//     console.log('🟢 BlazePose loaded');
//   }
//   return detector;
// }

// app.post('/analyze-posture', multer().single('image'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No image file' });

//     // jpeg buffer → canvas → tensor
//     const img = await loadImage(req.file.buffer);
//     const canvas = createCanvas(img.width, img.height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(img, 0, 0, img.width, img.height);

//     await tf.setBackend('cpu');
//     const imgTensor = tf.browser.fromPixels(canvas);

//     const detector = await getDetector();
//     const poses = await detector.estimatePoses(imgTensor);
//     imgTensor.dispose();

//     if (!poses.length) {
//       return res.json({ angles: null, message: 'No pose detected' });
//     }

//     const kp = poses[0].keypoints;
//     const K = {};  // indexăm legendă după nume
//     kp.forEach(p => { K[p.name] = p; });

//     const LS = K['left_shoulder'], RS = K['right_shoulder'];
//     const LH = K['left_hip'], RH = K['right_hip'];

//     function angle(A, B) {
//       const dx = B.x - A.x, dy = B.y - A.y;
//       return Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
//     }

//     // Unghi de înclinare umăr / șold
//     const shoulderTilt = angle(LS, RS);
//     const hipTilt = angle(LH, RH);

//     // Punctele mijlocii pentru coloana vertebrală
//     const midShoulder = { x: (LS.x + RS.x) / 2, y: (LS.y + RS.y) / 2 };
//     const midHip = { x: (LH.x + RH.x) / 2, y: (LH.y + RH.y) / 2 };
//     const spineTilt = angle(midShoulder, midHip);
//     const diff180 = x => Math.abs(180 - x);

//     return res.json({
//       angles: {
//         shoulderTilt: Number(diff180(shoulderTilt.toFixed(1))),
//         hipTilt: Number(diff180(hipTilt.toFixed(1))),
//         spineTilt: Number(diff180(spineTilt.toFixed(1)))
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Exemplu de utilizare într-un endpoint:
// app.post('/draw-keypoints', async (req, res) => {
//   const { inputPath, outputPath } = req.body;
//   try {
//     await drawKeypointsOnImage(inputPath, outputPath);
//     res.json({ message: 'Keypoints desenate!' });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // ─── DB table creation ────────────────────────────────────────────────────────
// pool.query(`
//   CREATE TABLE IF NOT EXISTS students (
//     id SERIAL PRIMARY KEY,
//     name TEXT,
//     age INTEGER,
//     condition TEXT,
//     notes TEXT
//   )
// `, err => err
//   ? console.error('❌ students table:', err.message)
//   : console.log('✅ students table ready')
// );

// pool.query(`
//   CREATE TABLE IF NOT EXISTS measurements (
//     id SERIAL PRIMARY KEY,
//     student_id INTEGER REFERENCES students(id),
//     height INTEGER,
//     weight INTEGER,
//     head_circumference INTEGER,
//     chest_circumference INTEGER,
//     abdominal_circumference INTEGER,
//     physical_disability TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   )
// `, err => err
//   ? console.error('❌ measurements table:', err.message)
//   : console.log('✅ measurements table ready')
// );

// pool.query(`
//   CREATE TABLE IF NOT EXISTS sessions (
//     id SERIAL PRIMARY KEY,
//     student_id INTEGER REFERENCES students(id),
//     session_date DATE DEFAULT CURRENT_DATE,
//     notes TEXT,
//     session_type TEXT DEFAULT 'evaluare'
//   )
// `, err => err
//   ? console.error('❌ sessions table:', err.message)
//   : console.log('✅ sessions table ready')
// );


// pool.query(`
//   CREATE TABLE IF NOT EXISTS photos (
//     id SERIAL PRIMARY KEY,
//     student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
//     uri TEXT NOT NULL,
//     created_at TIMESTAMPTZ DEFAULT NOW()
//   );
// `, err => err
//   ? console.error('❌ photos table:', err.message)
//   : console.log('✅ photos table ready')
// );

// // ─── STUDENTS CRUD ───────────────────────────────────────────────────────────
// app.get('/students', async (req, res) => {
//   try {
//     const { rows } = await pool.query('SELECT * FROM students ORDER BY id DESC');
//     res.json(rows);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });
// app.post('/students', async (req, res) => {
//   const { name, age, condition, notes } = req.body;
//   try {
//     await pool.query(
//       'INSERT INTO students (name, age, condition, notes) VALUES ($1,$2,$3,$4)',
//       [name, age, condition, notes]
//     );
//     res.status(201).json({ message: 'Student adăugat cu succes!' });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });
// app.put('/students/:id', async (req, res) => {
//   const { id } = req.params;
//   const { name, age, condition, notes } = req.body;
//   try {
//     await pool.query(
//       `UPDATE students SET name=$1, age=$2, condition=$3, notes=$4 WHERE id=$5`,
//       [name, age, condition, notes, id]
//     );
//     res.json({ message: 'Student actualizat!' });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });
// app.delete('/students/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.query('DELETE FROM measurements WHERE student_id=$1', [id]);
//     await pool.query('DELETE FROM sessions     WHERE student_id=$1', [id]);
//     await pool.query('DELETE FROM photos       WHERE student_id=$1', [id]);
//     await pool.query('DELETE FROM students     WHERE id=$1', [id]);
//     res.json({ message: 'Student șters!' });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // ─── MEASUREMENTS CRUD ───────────────────────────────────────────────────────
// app.post('/measurements', async (req, res) => {
//   const body = req.body;
//   try {
//     await pool.query(
//       `INSERT INTO measurements (
//          student_id, height, weight,
//          head_circumference, chest_circumference,
//          abdominal_circumference, physical_disability
//        ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
//       [
//         body.student_id, body.height, body.weight,
//         body.head_circumference, body.chest_circumference,
//         body.abdominal_circumference, body.physical_disability
//       ]
//     );
//     res.status(201).json({ message: 'Măsurători salvate!' });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });
// app.get('/students/:id/measurements', async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       'SELECT * FROM measurements WHERE student_id=$1 ORDER BY created_at DESC',
//       [req.params.id]
//     );
//     res.json(rows);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });
// app.put('/measurements/:id', async (req, res) => {
//   const { id } = req.params;
//   const b = req.body;
//   try {
//     await pool.query(
//       `UPDATE measurements
//          SET height=$1, weight=$2,
//              head_circumference=$3, chest_circumference=$4,
//              abdominal_circumference=$5, physical_disability=$6
//        WHERE id=$7`,
//       [
//         b.height, b.weight,
//         b.head_circumference, b.chest_circumference,
//         b.abdominal_circumference, b.physical_disability,
//         id
//       ]
//     );
//     res.json({ message: 'Măsurătoare actualizată!' });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });
// app.delete('/measurements/:id', async (req, res) => {
//   try {
//     await pool.query('DELETE FROM measurements WHERE id=$1', [req.params.id]);
//     res.json({ message: 'Măsurătoare ștearsă!' });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // ─── SESSIONS CRUD ───────────────────────────────────────────────────────────
// app.post('/sessions', async (req, res) => {
//   const { student_id, session_date, notes, session_type } = req.body;
//   try {
//     await pool.query(
//       'INSERT INTO sessions (student_id, session_date, notes, session_type) VALUES ($1,$2,$3,$4)',
//       [student_id, session_date, notes, session_type || 'evaluare']
//     );
//     res.status(201).json({ message: 'Sesiune adăugată!' });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });
// app.get('/students/:id/sessions', async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       'SELECT * FROM sessions WHERE student_id=$1 ORDER BY session_date DESC',
//       [req.params.id]
//     );
//     res.json(rows);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });
// app.put('/sessions/:id', async (req, res) => {
//   const { id } = req.params;
//   const { session_date, notes, session_type } = req.body;
//   try {
//     await pool.query(
//       'UPDATE sessions SET session_date=$1, notes=$2, session_type=$3 WHERE id=$4',
//       [session_date, notes, session_type || 'evaluare', id]
//     );
//     res.json({ message: 'Sesiune actualizată!' });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });
// app.delete('/sessions/:id', async (req, res) => {
//   try {
//     await pool.query('DELETE FROM sessions WHERE id=$1', [req.params.id]);
//     res.json({ message: 'Sesiune ștearsă!' });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // ─── PHOTOS CRUD ─────────────────────────────────────────────────────────────
// app.get('/students/:id/photos', async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       'SELECT id, uri, created_at FROM photos WHERE student_id=$1 ORDER BY created_at DESC',
//       [req.params.id]
//     );
//     res.json(rows);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// app.post('/photos', async (req, res) => {
//   const { student_id, uri } = req.body;
//   if (!student_id || !uri) {
//     return res.status(400).json({ error: 'student_id and uri are required' });
//   }
//   try {
//     const { rows } = await pool.query(
//       'INSERT INTO photos (student_id, uri) VALUES ($1,$2) RETURNING id, uri, created_at',
//       [student_id, uri]
//     );
//     res.status(201).json(rows[0]);
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // ─── FILE UPLOAD endpoint ────────────────────────────────────────────────────
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const name = `student${req.body.student_id}_${Date.now()}${ext}`;
//     cb(null, name);
//   }
// });
// const uploadPhoto = multer({ storage });

// app.post('/photos/upload', uploadPhoto.single('photo'), async (req, res) => {
//   console.log('req.body:', req.body);
//   console.log('req.file:', req.file);
//   try {
//     if (!req.file || !req.body.student_id) {
//       return res.status(400).json({ error: 'Missing file or student_id' });
//     }

//     // build an absolute URL to the file we just saved:
//     const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

//     // save that URL in the photos table:
//     const { rows } = await pool.query(
//       `INSERT INTO photos (student_id, uri)
//          VALUES ($1, $2)
//        RETURNING id, uri, created_at`,
//       [req.body.student_id, fullUrl]
//     );

//     res.status(201).json(rows[0]);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: e.message });
//   }
// });

// // DELETE a photo record
// app.delete('/photos/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     // delete from DB (and optionally unlink file from disk)
//     await pool.query('DELETE FROM photos WHERE id=$1', [id]);
//     res.json({ message: 'Photo deleted.' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update photo URIs
// const BASE = 'http://localhost:3000/uploads/';

// (async () => {
//   const { rows } = await pool.query('SELECT id, uri FROM photos');
//   for (const row of rows) {
//     if (!row.uri.startsWith('http')) {
//       const newUri = BASE + row.uri;
//       await pool.query('UPDATE photos SET uri=$1 WHERE id=$2', [newUri, row.id]);
//       console.log(`Updated photo ${row.id}`);
//     }
//   }
//   // process.exit();
// })();

// // serve the uploads folder at /uploads
// app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// // ─── START SERVER ────────────────────────────────────────────────────────────
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => res.json({ ok: true }));

const app = express();
app.use('/students', router);
app.listen(3001, () => console.log('Test server running!'));
