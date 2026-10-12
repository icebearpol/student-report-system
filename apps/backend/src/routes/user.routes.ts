import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { completeProfile } from '../controllers/user.controller';

const router = Router();

function handleValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.patch(
  '/me/complete-profile',
  requireAuth,
  [
    body('username').notEmpty().withMessage('Username is required').trim(),
    body('studentId').optional({ checkFalsy: true }).trim(),
    body('role').isIn(['STUDENT', 'PROFESSOR', 'PREFER_NOT_TO_SAY']),
  ],
  handleValidation,
  completeProfile
);

export default router;