import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import reportsRoutes from './routes/reports.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';
import notificationsRoutes from './routes/notifications.routes';
import emergencyRoutes from './routes/emergency.routes';
import adminRoutes from './routes/admin.routes';
import { aiEnabled, aiProvider, aiModelName } from './lib/aiModeration';
import { startPurgeJob, RETENTION_DAYS } from './controllers/trash.controller';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.use((req, res, next) => {
  const started = Date.now();
  console.log(`-> ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    console.log(`<- ${req.method} ${req.originalUrl} ${res.statusCode} (${Date.now() - started}ms)`);
  });
  next();
});

app.get('/', (_req, res) => res.json({ message: 'CampusFix backend is running' }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/uploads', uploadRoutes);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`CampusFix backend listening on http://localhost:${PORT}`);
  console.log(
    aiEnabled
      ? `AI screening: ON (${aiProvider} / ${aiModelName})`
      : 'AI screening: OFF - add GEMINI_API_KEY or ANTHROPIC_API_KEY to apps/backend/.env'
  );
  console.log(`Removed reports are deleted automatically after ${RETENTION_DAYS} days.`);
  startPurgeJob();
});