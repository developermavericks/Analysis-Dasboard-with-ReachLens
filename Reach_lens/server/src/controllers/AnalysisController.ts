import type { Request, Response } from 'express';
import { SmartScraper } from '../services/SmartScraper.js';
import { SocialScraperService } from '../services/SocialScraperService.js';
import { ReachEstimator } from '../services/ReachEstimator.js';
import * as xlsx from 'xlsx';
import multer from 'multer';
// import db from '../db.js'; // Removed for stateless deployment


const smartScraper = new SmartScraper();
const socialScraper = new SocialScraperService();

// Multer config for file uploads
export const upload = multer({ storage: multer.memoryStorage() });

async function performAnalysis(url: string, version: string) {
    try {
        const [smartResult, redditResult] = await Promise.all([
            smartScraper.scrapeUrl(url),
            socialScraper.scrapeReddit(url)
        ]);

        const googleCount = smartResult.totalMentions || 0;
        const redditCount = redditResult.count || 0;
        const totalMentions = googleCount + redditCount;

        let estimatedReach = 0;
        let confidenceScore = 0;
        let sentimentScore = 0;

        // --- Versioned Logic ---
        let uv = 0;
        let upv = 0;

        if (smartResult.source === 'Estimator') {
            const estimate = ReachEstimator.estimate(url, smartResult.title || '', version, smartResult);
            estimatedReach = estimate.reach;
            confidenceScore = estimate.confidence;
            sentimentScore = estimate.sentimentScore;
            // @ts-ignore
            if (estimate.uv) uv = estimate.uv;
            // @ts-ignore
            if (estimate.upv) upv = estimate.upv;
        } else {
            confidenceScore = 100;
            let avgDomainWeight = 1;
            if (smartResult.domains && smartResult.domains.length > 0) {
                const weights = smartResult.domains.map(d => ReachEstimator.getDomainWeight(d));
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                avgDomainWeight = totalWeight / weights.length;
            }

            let baseVal = 500;
            let positionalWeight = 1.0;
            if (version === 'v4') baseVal = 425;
            if (version === 'v5') baseVal = 380;
            if (version === 'v6') baseVal = 350;

            if (version !== 'v2') {
                positionalWeight = smartResult.prominenceScore || 1.0;
            }

            let indexingBonus = 5000;
            if (smartResult.domains.some(d => d.includes('news') || d.includes('times') || d.includes('post'))) {
                indexingBonus = 10000;
            }

            if ((version === 'v4' || version === 'v5' || version === 'v6') &&
                smartResult.domains.some(d => d.includes('perplexity') || d.includes('gemini') || d.includes('chatgpt'))) {
                indexingBonus += 25000;
            }

            estimatedReach = ((googleCount + redditCount) * baseVal * avgDomainWeight * positionalWeight) + indexingBonus;

            if ((version === 'v4' || version === 'v5' || version === 'v6')) {
                sentimentScore = ReachEstimator.analyzeSentiment(
                    smartResult.title || '', 
                    smartResult.metaDescription, 
                    smartResult.snippet
                );
            }
        }

        let provenanceTier = 'T0';
        if (version === 'v9') {
            const topDomains = smartResult.domains.slice(0, 5);
            const targetDomain = new URL(url).hostname.replace('www.', '');
            const isTargetInTop3 = topDomains.slice(0, 3).some(d => targetDomain.includes(d));
            
            if (isTargetInTop3) provenanceTier = 'T0';
            else if (topDomains.some(d => d.includes('msn.com') || d.includes('yahoo.com') || d.includes('apnews.com') || d.includes('reuters.com'))) provenanceTier = 'T1';
            else if (topDomains.length > 0) provenanceTier = 'T2';
            else provenanceTier = 'T3';
        }

        const isReprint = provenanceTier !== 'T0';
        const modifiers = ReachEstimator.applyModifiers(estimatedReach, version, new Date(), smartResult.domains, {
            ...smartResult,
            isReprint,
            provenanceTier,
            url
        });
        
        estimatedReach = modifiers.finalReach;
        const velocity = modifiers.velocity;
        const agenticStatus = modifiers.agenticStatus;
        const uvr = (modifiers as any).uv;
        const entropy = (modifiers as any).entropy || 0;

        return {
            url,
            totalMentions,
            googleMentions: googleCount,
            redditMentions: redditCount,
            estimatedReach,
            confidenceScore,
            sentimentScore,
            velocity,
            agenticStatus,
            version,
            uvr: uvr || uv,
            entropy,
            title: smartResult.title || 'N/A'
        };
    } catch (error) {
        console.error(`Analysis failed for ${url}:`, error);
        throw error;
    }
}

export const analyzeUrl = async (req: Request, res: Response) => {
    let { url, version } = req.body;
    if (!url) {
        res.status(400).json({ error: 'URL is required' });
        return;
    }
    if (!version) version = 'v5';
    if (!['v2', 'v3', 'v4', 'v5', 'v6'].includes(version)) version = 'v5';

    try {
        // We still need the full response for the detailed UI, so we call the internal logic and re-wrap
        // Actually, let's just keep the original detailed logic here or refactor it better.
        // For simplicity, I'll keep the original detailed response in analyzeUrl and use performAnalysis for bulk.
        // But let's check if I can just use performAnalysis and add the "breakdown" part.
        
        const [smartResult, redditResult] = await Promise.all([
            smartScraper.scrapeUrl(url),
            socialScraper.scrapeReddit(url)
        ]);

        const googleCount = smartResult.totalMentions || 0;
        const redditCount = redditResult.count || 0;
        const totalMentions = googleCount + redditCount;

        let estimatedReach = 0;
        let confidenceScore = 0;
        let sentimentScore = 0;
        let uv = 0;
        let upv = 0;

        if (smartResult.source === 'Estimator') {
            const estimate = ReachEstimator.estimate(url, smartResult.title || '', version, smartResult);
            estimatedReach = estimate.reach;
            confidenceScore = estimate.confidence;
            sentimentScore = estimate.sentimentScore;
            if (estimate.uv) uv = estimate.uv;
            if (estimate.upv) upv = estimate.upv;
        } else {
            confidenceScore = 100;
            let avgDomainWeight = 1;
            if (smartResult.domains && smartResult.domains.length > 0) {
                const weights = smartResult.domains.map(d => ReachEstimator.getDomainWeight(d));
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                avgDomainWeight = totalWeight / weights.length;
            }
            let baseVal = 500;
            let positionalWeight = 1.0;
            if (version === 'v4') baseVal = 425;
            if (version === 'v5') baseVal = 380;
            if (version === 'v6') baseVal = 350;
            if (version !== 'v2') positionalWeight = smartResult.prominenceScore || 1.0;
            let indexingBonus = 5000;
            if (smartResult.domains.some(d => d.includes('news') || d.includes('times') || d.includes('post'))) indexingBonus = 10000;
            if ((version === 'v4' || version === 'v5' || version === 'v6') &&
                smartResult.domains.some(d => d.includes('perplexity') || d.includes('gemini') || d.includes('chatgpt'))) indexingBonus += 25000;
            estimatedReach = ((googleCount + redditCount) * baseVal * avgDomainWeight * positionalWeight) + indexingBonus;
            if ((version === 'v4' || version === 'v5' || version === 'v6')) {
                sentimentScore = ReachEstimator.analyzeSentiment(smartResult.title || '', smartResult.metaDescription, smartResult.snippet);
            }
        }

        let provenanceTier = 'T0';
        if (version === 'v9') {
            const topDomains = smartResult.domains.slice(0, 5);
            const targetDomain = new URL(url).hostname.replace('www.', '');
            const isTargetInTop3 = topDomains.slice(0, 3).some(d => targetDomain.includes(d));
            if (isTargetInTop3) provenanceTier = 'T0';
            else if (topDomains.some(d => d.includes('msn.com') || d.includes('yahoo.com') || d.includes('apnews.com') || d.includes('reuters.com'))) provenanceTier = 'T1';
            else if (topDomains.length > 0) provenanceTier = 'T2';
            else provenanceTier = 'T3';
        }

        const isReprint = provenanceTier !== 'T0';
        const modifiers = ReachEstimator.applyModifiers(estimatedReach, version, new Date(), smartResult.domains, {
            ...smartResult, isReprint, provenanceTier, url
        });
        estimatedReach = modifiers.finalReach;
        const velocity = modifiers.velocity;
        const agenticStatus = modifiers.agenticStatus;
        const uvr = (modifiers as any).uv;

        res.json({
            id: Math.floor(Math.random() * 1000000),
            url, totalMentions, estimatedReach, confidenceScore, sentimentScore,
            velocity, agenticStatus, version,
            breakdown: {
                google: { ...smartResult, totalMentions: googleCount },
                reddit: redditResult,
                meta: {
                    agenticStatus,
                    logic: getVersionName(version),
                    uv: uvr || uv,
                    upv: (modifiers as any).upv,
                    socialProof: smartResult.socialProof,
                    isReprint, provenanceTier,
                    entropy: (modifiers as any).entropy
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Analysis failed' });
    }
};

export const bulkAnalyze = async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: 'Excel file is required' });
        return;
    }

    const { version = 'v5' } = req.body;

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            res.status(400).json({ error: 'Excel file has no sheets' });
            return;
        }
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
            res.status(400).json({ error: 'Excel sheet not found' });
            return;
        }
        const data: any[] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        const urls: string[] = data
            .map(row => (row[0] || '').toString().trim())
            .filter(url => url.startsWith('http'));

        if (urls.length === 0) {
            res.status(400).json({ error: 'No valid URLs found in the first column' });
            return;
        }

        const results = [];
        for (const url of urls) {
            try {
                const result = await performAnalysis(url, version);
                results.push({
                    'URL': result.url,
                    'Estimated Reach': Math.round(result.estimatedReach),
                    'UVR (Unique Reach)': Math.round(result.uvr)
                });
            } catch (err) {
                results.push({
                    'URL': url,
                    'Estimated Reach': 0,
                    'UVR (Unique Reach)': 0
                });
            }
        }

        const newSheet = xlsx.utils.json_to_sheet(results);
        const newWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Analysis Results');
        
        const buffer = xlsx.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=reachlens_analysis.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error('Bulk analysis failed:', error);
        res.status(500).json({ error: 'Bulk analysis failed' });
    }
};

function getVersionName(v: string) {
    if (v === 'v2') return 'Dual-Core (Verified + Drift)';
    if (v === 'v3') return 'Contextual (Heat Map + Industry)';
    if (v === 'v4') return 'Causal (Sentiment + GEO Detection)';
    if (v === 'v5') return 'Behavioral (Agentic + SISI)';
    return 'Integrated (Grounded + Stickiness)';
}
