import express from 'express';
import { analyzeUrl, bulkAnalyze, upload } from '../controllers/AnalysisController.js';

const router = express.Router();

router.post('/analyze', analyzeUrl);
router.post('/bulk-analyze', upload.single('file'), bulkAnalyze);

export default router;
