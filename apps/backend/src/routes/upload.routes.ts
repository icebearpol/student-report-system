import express, { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const uploadDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_BYTES = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXTENSIONS[file.mimetype] || '.jpg'}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype in EXTENSIONS),
});

const single = upload.single('photo');

const WINDOW_MS = 10 * 60 * 1000;
const MAX_UPLOADS = 20;
const hits = new Map<string, number[]>();

function tooManyUploads(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_UPLOADS;
}

function looksLikeImage(file: string) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(12);
  fs.readSync(fd, buf, 0, 12, 0);
  fs.closeSync(fd);
  const jpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const png = buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const webp = buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
  return jpeg || png || webp;
}

const router = Router();

router.post('/', (req, res) => {
  if (tooManyUploads(req.ip || 'unknown')) {
    return res.status(429).json({ error: 'Too many uploads. Please wait a few minutes and try again.' });
  }

  single(req, res, (error) => {
    if (error) {
      return res.status(400).json({ error: 'The photo could not be uploaded. Use a JPEG, PNG, or WebP image under 5 MB.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a JPEG, PNG, or WebP image up to 5 MB.' });
    }
    if (!looksLikeImage(req.file.path)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: 'That file is not a valid image.' });
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

router.post('/base64', express.json({ limit: '8mb' }), (req, res) => {
  if (tooManyUploads(req.ip || 'unknown')) {
    return res.status(429).json({ error: 'Too many uploads. Please wait a few minutes and try again.' });
  }

  const { data, mime } = req.body || {};
  const extension = typeof mime === 'string' ? EXTENSIONS[mime] : undefined;
  if (typeof data !== 'string' || !extension) {
    return res.status(400).json({ error: 'Please upload a JPEG, PNG, or WebP image.' });
  }

  const buffer = Buffer.from(data.replace(/^data:[^;]+;base64,/, ''), 'base64');
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    return res.status(400).json({ error: 'The photo must be under 5 MB. Please use a smaller photo.' });
  }

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;
  const file = path.join(uploadDir, filename);
  fs.writeFileSync(file, buffer);

  if (!looksLikeImage(file)) {
    fs.unlinkSync(file);
    return res.status(400).json({ error: 'That file is not a valid image.' });
  }

  res.status(201).json({ url: `/uploads/${filename}` });
});

router.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  const tooLarge = error?.status === 413 || error?.type === 'entity.too.large';
  res.status(tooLarge ? 413 : 400).json({
    error: tooLarge
      ? 'The photo is too large. Please use a smaller photo.'
      : 'The photo could not be read. Please try another one.',
  });
});

export default router;