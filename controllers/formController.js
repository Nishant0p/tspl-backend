const { Contact, Service, Job } = require('../models');
const ExcelJS = require('exceljs');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const STRAPI_ENDPOINT = process.env.STRAPI_ENDPOINT;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

async function appendExcel(sheetName, row) {
  const file = path.join(UPLOAD_DIR, `${sheetName}.xlsx`);
  const workbook = new ExcelJS.Workbook();
  if (fs.existsSync(file)) {
    await workbook.xlsx.readFile(file);
  }
  let ws = workbook.getWorksheet(sheetName);
  if (!ws) ws = workbook.addWorksheet(sheetName);
  if (ws.rowCount === 0) {
    ws.addRow(Object.keys(row));
  }
  ws.addRow(Object.values(row));
  await workbook.xlsx.writeFile(file);
}

async function forwardToStrapi(pathname, payload) {
  if (!STRAPI_ENDPOINT) return;
  try {
    const url = `${STRAPI_ENDPOINT}${pathname}`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('Strapi forward failed', e.message);
  }
}

exports.submit = async (req, res) => {
  const type = req.body.type || 'contact';
  const data = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    message: req.body.message,
    metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {}
  };

  try {
    let created;
    if (type === 'service') {
      created = await Service.create(data);
      await appendExcel('services', { createdAt: new Date().toISOString(), ...data });
      await forwardToStrapi('/services', data);
    } else if (type === 'job') {
      // handle file uploads
      const pdf = req.files && req.files['pdf'] ? req.files['pdf'][0].filename : null;
      const cv = req.files && req.files['cv'] ? req.files['cv'][0].filename : null;
      created = await Job.create({ ...data, pdf, cv });
      await appendExcel('jobs', { createdAt: new Date().toISOString(), ...data, pdf, cv });
      await forwardToStrapi('/jobs', { ...data, pdf, cv });
    } else {
      created = await Contact.create(data);
      await appendExcel('contacts', { createdAt: new Date().toISOString(), ...data });
      await forwardToStrapi('/contacts', data);
    }
    res.json({ ok: true, id: created.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
};

exports.list = async (req, res) => {
  const section = req.params.section;
  try {
    if (section === 'contacts') {
      const items = await Contact.findAll({ order: [['createdAt', 'DESC']] });
      return res.json(items);
    }
    if (section === 'services') {
      const items = await Service.findAll({ order: [['createdAt', 'DESC']] });
      return res.json(items);
    }
    if (section === 'jobs') {
      const items = await Job.findAll({ order: [['createdAt', 'DESC']] });
      return res.json(items);
    }
    res.status(400).json({ error: 'unknown_section' });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
};

exports.preview = async (req, res) => {
  const filename = req.params.filename;
  // Security: prevent directory traversal
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ error: 'invalid_filename' });
  }
  
  const filepath = path.join(UPLOAD_DIR, filename);
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'file_not_found' });
  }
  
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  if (ext === '.pdf') contentType = 'application/pdf';
  else if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.gif') contentType = 'image/gif';
  
  // Serve file with inline disposition for browser preview
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  const stream = fs.createReadStream(filepath);
  stream.pipe(res);
  stream.on('error', () => {
    res.status(500).json({ error: 'stream_error' });
  });
};

exports.download = async (req, res) => {
  const filename = req.params.filename;
  // Security: prevent directory traversal
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ error: 'invalid_filename' });
  }
  
  const filepath = path.join(UPLOAD_DIR, filename);
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'file_not_found' });
  }
  
  // Serve file with attachment disposition for download
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  const stream = fs.createReadStream(filepath);
  stream.pipe(res);
  stream.on('error', () => {
    res.status(500).json({ error: 'stream_error' });
  });
};
