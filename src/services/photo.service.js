const Photo = require('../domain/entities/photo');
const repo = require('../repositories/photo.repository');
const path = require('path');
const fs   = require('fs').promises;

module.exports = {
  async createPhoto(data) {
    const p = new Photo(data);
    return await repo.create(p);
  },

  async getPhotosByStudent(student_id) {
    return await repo.findByStudent(Number(student_id));
  },

  async deletePhoto(id) {
    // opțional: ştergi şi fişierul de pe disc dacă vrei
    return await repo.delete(Number(id));
  },

  async uploadPhoto(req) {
    const file = req.file;
    const student_id = Number(req.body.student_id); 
    const filename = file.filename;
    const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

    if (isNaN(student_id)) {
      throw new Error('Invalid student_id: must be a number');
    }

    const p = new Photo({ student_id, uri: fullUrl });
    const saved = await repo.create(p);
    return { ...saved, uri: fullUrl }; // Returnăm URL-ul complet pentru frontend
  }
};
