import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { optionalAuth } from '../middleware/optionalAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import * as reports from '../controllers/reports.controller';
import { checkDuplicates } from '../controllers/duplicates.controller';

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

router.get('/', optionalAuth, wrap(reports.getAllReports));
router.post('/duplicates', optionalAuth, wrap(checkDuplicates));
router.get('/:id', optionalAuth, wrap(reports.getReportById));

router.post(
  '/',
  optionalAuth,
  [body('title').notEmpty().trim().escape(), body('description').notEmpty().trim()],
  handleValidation,
  wrap(reports.createReport)
);

router.post('/:id/upvote', optionalAuth, wrap(reports.upvoteReport));
router.delete('/:id', requireAuth, wrap(reports.deleteReport));
router.patch('/:id', requireAuth, requireAdmin, wrap(reports.updateReport));

router.post('/:id/remove', requireAuth, requireAdmin, wrap(reports.removeReport));
router.post('/:id/restore', requireAuth, requireAdmin, wrap(reports.restoreReport));

router.get('/:id/comments', requireAuth, wrap(reports.getComments));
router.post('/:id/comments', requireAuth, wrap(reports.addComment));
router.patch('/:id/comments/:commentId', requireAuth, wrap(reports.editComment));
router.delete('/:id/comments/:commentId', requireAuth, wrap(reports.unsendComment));

router.post('/:id/alert', requireAuth, requireAdmin, wrap(reports.publishAlert));
router.delete('/:id/alert', requireAuth, requireAdmin, wrap(reports.retractAlert));

export default router;