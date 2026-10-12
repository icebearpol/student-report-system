import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import {
  signup,
  login,
  verifyEmail,
  resendCode,
  me,
  changePassword,
  deleteAccount,
} from '../controllers/auth.controller';

const router = Router();

function handleValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

type Handler = (req: Request, res: Response) => Promise<unknown>;

const wrap = (fn: Handler) => async (req: Request, res: Response) => {
  try {
    await fn(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').optional({ checkFalsy: true }).trim().escape(),
  ],
  handleValidation,
  wrap(signup)
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  handleValidation,
  wrap(login)
);

router.post(
  '/verify-email',
  requireAuth,
  [body('code').isLength({ min: 6, max: 6 }).isNumeric()],
  handleValidation,
  wrap(verifyEmail)
);

router.post('/resend-code', requireAuth, wrap(resendCode));
router.get('/me', requireAuth, wrap(me));
router.post('/change-password', requireAuth, wrap(changePassword));
router.post('/delete-account', requireAuth, wrap(deleteAccount));

export default router;