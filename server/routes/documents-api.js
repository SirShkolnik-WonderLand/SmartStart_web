const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const { isEmail, isIsoDate, isDomain, isYN, toCentsFromCadString } = require('../utils/validators');
const { computeDocumentHash } = require('../utils/canonicalize');
const { emitEvent } = require('../utils/events');

const prisma = new PrismaClient();
const router = express.Router();

function ensureDir(p) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function formatDateYYYYMMDD(d) {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${y}${m}${dd}`;
}

// ===== Issue SOBA =====
router.post('/issue/soba', authenticateToken, async(req, res) => {
    try {
        const payload = req.body || {};

        // Basic validations per rules
        if (!payload.subscriber_legal_name || payload.subscriber_legal_name.length < 2 || payload.subscriber_legal_name.length > 120)
            return res.status(400).json({ error: 'Invalid subscriber_legal_name' });
        if (!isIsoDate(payload.effective_date)) return res.status(400).json({ error: 'Invalid effective_date' });
        if (!isDomain(payload.project_domain)) return res.status(400).json({ error: 'Invalid project_domain' });
        const seatsCount = parseInt(payload.seats_count, 10);
        if (!Number.isInteger(seatsCount) || seatsCount < 1 || seatsCount > 500) return res.status(400).json({ error: 'Invalid seats_count' });
        if (!isEmail(payload.billing_email)) return res.status(400).json({ error: 'Invalid billing_email' });
        if (!payload.billing_address) return res.status(400).json({ error: 'Invalid billing_address' });
        if (!payload.payment_token_ref) return res.status(400).json({ error: 'Invalid payment_token_ref' });
        if (!isYN(payload.proration_choice)) return res.status(400).json({ error: 'Invalid proration_choice' });
        if (payload.accept_non_refundable !== 'Y' || payload.accept_security_baseline !== 'Y' || payload.accept_ptsa_binding !== 'Y')
            return res.status(400).json({ error: 'Policy confirmations must be Y' });

        const seats = Array.isArray(payload.seats) ? payload.seats : [];
        if (seats.length !== seatsCount) return res.status(400).json({ error: 'seats_count must equal number of seats' });
        const effectiveDate = new Date(payload.effective_date);
        const issueDate = new Date();

        // Derived fields
        const BASE_SEAT_FEE_CENTS = 10000;
        const daysInMonth = new Date(issueDate.getFullYear(), issueDate.getMonth() + 1, 0).getDate();

        // Validate seats and compute proration
        const seenEmails = new Set();
        let firstCycleTotalCents = 0;
        for (let i = 0; i < seats.length; i++) {
            const s = seats[i];
            if (!s.full_name || s.full_name.length < 2 || s.full_name.length > 80) return res.status(400).json({ error: `Invalid seat ${i + 1} full_name` });
            if (!/^[a-z0-9._-]+$/.test(s.local_part)) return res.status(400).json({ error: `Invalid seat ${i + 1} local_part` });
            const work_email = `${s.local_part}@${payload.project_domain}`;
            if (seenEmails.has(work_email)) return res.status(400).json({ error: `Duplicate work_email for seat ${i + 1}` });
            seenEmails.add(work_email);
            if (!s.role || s.role.length < 1 || s.role.length > 40) return res.status(400).json({ error: `Invalid seat ${i + 1} role` });
            if (!isYN(s.intune_ready)) return res.status(400).json({ error: `Invalid seat ${i + 1} intune_ready` });
            if (!isIsoDate(s.start_date)) return res.status(400).json({ error: `Invalid seat ${i + 1} start_date` });
            const sd = new Date(s.start_date);
            if (sd < effectiveDate) return res.status(400).json({ error: `Seat ${i + 1} start_date must be >= effective_date` });
            if (payload.proration_choice === 'Y' && (sd.getMonth() === issueDate.getMonth() && sd.getFullYear() === issueDate.getFullYear())) {
                const day = sd.getDate();
                const daysUsed = daysInMonth - day + 1;
                const prorated = Math.round(BASE_SEAT_FEE_CENTS * (daysUsed / daysInMonth));
                firstCycleTotalCents += prorated;
            } else {
                firstCycleTotalCents += BASE_SEAT_FEE_CENTS;
            }
        }

        const nextCyclesTotalCents = seatsCount * BASE_SEAT_FEE_CENTS;
        const taxRate = typeof payload.tax_rate === 'number' ? payload.tax_rate : 0;
        const totalsWithTax = Math.round(firstCycleTotalCents * (1 + taxRate));

        // Render text (simple placeholder; replace with real template renderer if available)
        const docText = [
            `SOBA – Seat Order & Billing Authorization`,
            `Subscriber: ${payload.subscriber_legal_name}`,
            `Domain: ${payload.project_domain}`,
            `Seats: ${seatsCount}`,
            `First cycle total (CAD): ${(firstCycleTotalCents / 100).toFixed(2)}`,
            `Next cycles (CAD): ${(nextCyclesTotalCents / 100).toFixed(2)}`,
            `Tax rate: ${(taxRate * 100).toFixed(2)}% | First-cycle w/ tax: ${(totalsWithTax / 100).toFixed(2)}`
        ].join('\n');

        const { canonicalText, hash } = computeDocumentHash(docText);

        // Persist payload and document under server/Contracts
        const payloadDir = path.join(process.cwd(), 'server', 'Contracts', 'payloads');
        const signedDir = path.join(process.cwd(), 'server', 'Contracts', 'signed');
        ensureDir(payloadDir);
        ensureDir(signedDir);

        const docId = `soba_${Date.now()}`;
        const datePart = formatDateYYYYMMDD(issueDate);
        const txtName = `SOBA_${payload.tenantId || 'default'}_${datePart}_${docId}.txt`;
        const payloadName = `SOBA_${docId}.json`;
        fs.writeFileSync(path.join(signedDir, txtName), canonicalText + `\nDOC HASH (sha256): ${hash}\n`, 'utf8');
        fs.writeFileSync(path.join(payloadDir, payloadName), JSON.stringify(payload, null, 2));

        emitEvent('document.drafted', { type: 'SOBA', docId });
        emitEvent('document.issued', { type: 'SOBA', docId, hash });

        res.json({
            success: true,
            doc_type: 'SOBA',
            doc_id: docId,
            doc_hash_sha256: hash,
            files: {
                txt: `/server/Contracts/signed/${txtName}`,
                payload: `/server/Contracts/payloads/${payloadName}`
            },
            summary: {
                seats_count: seatsCount,
                first_cycle_total_cents: firstCycleTotalCents,
                next_cycles_total_cents: nextCyclesTotalCents,
                tax_rate: taxRate,
                totals_with_tax: totalsWithTax
            }
        });
    } catch (e) {
        console.error('SOBA issue error:', e);
        res.status(500).json({ error: 'Failed to issue SOBA' });
    }
});

// ===== Issue PUOHA =====
router.post('/issue/puoha', authenticateToken, async(req, res) => {
    try {
        const p = req.body || {};
        if (!p.project_owner_legal_name || p.project_owner_legal_name.length < 2 || p.project_owner_legal_name.length > 120)
            return res.status(400).json({ error: 'Invalid project_owner_legal_name' });
        if (!p.project_id || p.project_id.length < 2 || p.project_id.length > 80)
            return res.status(400).json({ error: 'Invalid project_id' });
        if (!isIsoDate(p.effective_date)) return res.status(400).json({ error: 'Invalid effective_date' });

        // Baseline toggles (require Y or log exception)
        const baseline = p.baseline || {};
        const baselineKeys = ['m365_on', 'entra_mfa_on', 'intune_defender_on', 'github_org_on', 'cicd_secrets_on', 'backups_logs_on', 'dlp_on'];
        let baselineOk = true;
        for (const k of baselineKeys) {
            if (baseline[k] !== 'Y') baselineOk = false;
        }

        // Residency
        const residency = String(p.residency || 'CA');
        const nonCA = residency !== 'CA';

        // Render/DB/other estimates
        const toCentsMaybe = (v) => v ? toCentsFromCadString(String(v)) : 0;
        const est_render = toCentsMaybe(p.render_monthly_est_cad || '0.00');
        const est_db_total = Array.isArray(p.db) ? p.db.reduce((acc, d) => acc + toCentsMaybe(d.monthly_est_cad || '0.00'), 0) : 0;
        const est_gh = toCentsMaybe(p.gh_monthly_est_cad || '0.00');
        const est_sec = toCentsMaybe(p.sec_monthly_or_oneoff_cad || '0.00');
        const est_mon = toCentsMaybe(p.mon_monthly_est_cad || '0.00');
        const est_other = toCentsMaybe(p.other_monthly_est_cad || '0.00');
        const est_total_cents = est_render + est_db_total + est_gh + est_sec + est_mon + est_other;
        const taxRate = typeof p.tax_rate === 'number' ? p.tax_rate : 0;

        if (p.gh_advsec_enabled === 'Y' && (!p.repos_in_scope || String(p.repos_in_scope).trim().length === 0))
            return res.status(400).json({ error: 'repos_in_scope required when gh_advsec_enabled==Y' });

        if (!p.payer_entity) return res.status(400).json({ error: 'payer_entity required' });
        if (!isEmail(p.billing_email)) return res.status(400).json({ error: 'Invalid billing_email' });
        if (!p.payment_token_ref) return res.status(400).json({ error: 'payment_token_ref required' });
        if (p.agree_recurring !== 'Y') return res.status(400).json({ error: 'agree_recurring must be Y' });

        const summaryText = [
            `PUOHA – Project Upgrades Summary`,
            `Project: ${p.project_id} | Payer: ${p.payer_entity}`,
            `Residency: ${residency}`,
            `Line items (CAD/mo): Render=${(est_render / 100).toFixed(2)} DBs=${(est_db_total / 100).toFixed(2)} GH-AS=${(est_gh / 100).toFixed(2)} Sec/Testing=${(est_sec / 100).toFixed(2)} Monitoring=${(est_mon / 100).toFixed(2)} Other=${(est_other / 100).toFixed(2)}`,
            `Estimated total (CAD/mo): ${(est_total_cents / 100).toFixed(2)} (+ tax if applicable)`
        ].join('\n');

        const { canonicalText, hash } = computeDocumentHash(summaryText);

        const payloadDir = path.join(process.cwd(), 'server', 'Contracts', 'payloads');
        const signedDir = path.join(process.cwd(), 'server', 'Contracts', 'signed');
        ensureDir(payloadDir);
        ensureDir(signedDir);

        const docId = `puoha_${Date.now()}`;
        const issueDate = new Date();
        const datePart = formatDateYYYYMMDD(issueDate);
        const txtName = `PUOHA_${p.project_id}_${datePart}_${docId}.txt`;
        const payloadName = `PUOHA_${docId}.json`;
        fs.writeFileSync(path.join(signedDir, txtName), canonicalText + `\nDOC HASH (sha256): ${hash}\n`, 'utf8');
        fs.writeFileSync(path.join(payloadDir, payloadName), JSON.stringify(p, null, 2));

        emitEvent('document.drafted', { type: 'PUOHA', docId });
        emitEvent('document.issued', { type: 'PUOHA', docId, hash, nonCA });

        res.json({
            success: true,
            doc_type: 'PUOHA',
            doc_id: docId,
            doc_hash_sha256: hash,
            needs_legal_approval: !!nonCA,
            needs_sec_approval: !baselineOk,
            files: {
                txt: `/server/Contracts/signed/${txtName}`,
                payload: `/server/Contracts/payloads/${payloadName}`
            },
            summary: {
                est_render,
                est_db_total,
                est_gh,
                est_sec,
                est_mon,
                est_other,
                est_total_cents,
                tax_rate: taxRate
            }
        });
    } catch (e) {
        console.error('PUOHA issue error:', e);
        res.status(500).json({ error: 'Failed to issue PUOHA' });
    }
});

// ===== Sign document (SOBA/PUOHA) =====
router.post('/:docId/sign', authenticateToken, async(req, res) => {
    try {
        const { docId } = req.params;
        const { signer_name, signer_title, signer_email, ip, user_agent, timestamp_iso, otp_or_mfa_code_last4, expected_doc_hash } = req.body || {};
        if (!signer_name || !signer_email || !isEmail(signer_email)) return res.status(400).json({ error: 'Invalid signer info' });
        if (!expected_doc_hash) return res.status(400).json({ error: 'expected_doc_hash required' });

        // Minimal verification: ensure the TXT exists and recompute hash
        const signedDir = path.join(process.cwd(), 'server', 'Contracts', 'signed');
        const files = fs.readdirSync(signedDir).filter(f => f.includes(docId) && f.endsWith('.txt'));
        if (files.length === 0) return res.status(404).json({ error: 'Document not found' });
        const docPath = path.join(signedDir, files[0]);
        const text = fs.readFileSync(docPath, 'utf8');
        const contentWithoutHash = text.replace(/\nDOC HASH \(sha256\): [a-f0-9]{64}\n?$/i, '');
        const { hash } = computeDocumentHash(contentWithoutHash);
        if (hash !== expected_doc_hash) return res.status(400).json({ error: 'Hash mismatch. Re-generate and sign again.' });

        // Persist signature evidence (JSON log)
        const evidenceDir = path.join(process.cwd(), 'server', 'Contracts', 'payloads');
        ensureDir(evidenceDir);
        const ev = { docId, signer_name, signer_title, signer_email, ip, user_agent, timestamp_iso: timestamp_iso || new Date().toISOString(), otp_or_mfa_code_last4: otp_or_mfa_code_last4 || null, doc_hash_sha256: hash };
        fs.writeFileSync(path.join(evidenceDir, `${docId}_signature_${Date.now()}.json`), JSON.stringify(ev, null, 2));

        emitEvent('document.signed', { docId, signer_email });
        emitEvent('document.fully_executed', { docId });

        if (docId.startsWith('soba_')) emitEvent('billing.seats.updated', { docId });
        if (docId.startsWith('puoha_')) emitEvent('project.upgrades.updated', { docId });

        res.json({ success: true, message: 'Signed', evidence: ev });
    } catch (e) {
        console.error('Sign doc error:', e);
        res.status(500).json({ error: 'Failed to sign' });
    }
});

// ===== Templates & Library Endpoints =====
const CONTRACTS_DIR = path.join(__dirname, '../Contracts');

const DOCUMENT_CATEGORIES = {
    'platform-agreements': {
        name: 'Platform Agreements',
        description: 'Core platform terms and conditions',
        icon: '📋'
    },
    'confidentiality': {
        name: 'Confidentiality & NDA',
        description: 'Non-disclosure and confidentiality agreements',
        icon: '🔒'
    },
    'intellectual-property': {
        name: 'Intellectual Property',
        description: 'IP ownership and assignment agreements',
        icon: '💡'
    },
    'project-specific': {
        name: 'Project-Specific',
        description: 'Project-level agreements and addenda',
        icon: '📄'
    },
    'collaboration': {
        name: 'Collaboration',
        description: 'Joint development and collaboration agreements',
        icon: '🤝'
    }
};

router.get('/templates', async(req, res) => {
    try {
        const templates = [];
        const files = await fsp.readdir(CONTRACTS_DIR);
        for (const file of files) {
            if (file.endsWith('.txt')) {
                const filePath = path.join(CONTRACTS_DIR, file);
                const content = await fsp.readFile(filePath, 'utf8');
                const stats = await fsp.stat(filePath);
                let category = 'platform-agreements';
                const lower = file.toLowerCase();
                if (lower.includes('nda') || lower.includes('confidentiality')) category = 'confidentiality';
                else if (lower.includes('ip') || lower.includes('intellectual')) category = 'intellectual-property';
                else if (lower.includes('project') || lower.includes('addendum')) category = 'project-specific';
                else if (lower.includes('collaboration') || lower.includes('joint')) category = 'collaboration';

                templates.push({
                    id: file.replace('.txt', '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    title: file.replace('.txt', ''),
                    filename: file,
                    category,
                    categoryInfo: DOCUMENT_CATEGORIES[category],
                    content,
                    size: stats.size,
                    lastModified: stats.mtime,
                    wordCount: content.split(/\s+/).length,
                    lineCount: content.split('\n').length
                });
            }
        }
        res.json({ success: true, data: { templates, categories: DOCUMENT_CATEGORIES, totalTemplates: templates.length } });
    } catch (error) {
        console.error('Error fetching document templates:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch document templates', error: error.message });
    }
});

router.get('/templates/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const files = await fsp.readdir(CONTRACTS_DIR);
        const file = files.find(f => f.replace('.txt', '').toLowerCase().replace(/[^a-z0-9]/g, '-') === id);
        if (!file) return res.status(404).json({ success: false, message: 'Document template not found' });
        const filePath = path.join(CONTRACTS_DIR, file);
        const content = await fsp.readFile(filePath, 'utf8');
        const stats = await fsp.stat(filePath);
        let category = 'platform-agreements';
        const lower = file.toLowerCase();
        if (lower.includes('nda') || lower.includes('confidentiality')) category = 'confidentiality';
        else if (lower.includes('ip') || lower.includes('intellectual')) category = 'intellectual-property';
        else if (lower.includes('project') || lower.includes('addendum')) category = 'project-specific';
        else if (lower.includes('collaboration') || lower.includes('joint')) category = 'collaboration';
        const template = { id, title: file.replace('.txt', ''), filename: file, category, categoryInfo: DOCUMENT_CATEGORIES[category], content, size: stats.size, lastModified: stats.mtime, wordCount: content.split(/\s+/).length, lineCount: content.split('\n').length };
        res.json({ success: true, data: template });
    } catch (error) {
        console.error('Error fetching document template:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch document template', error: error.message });
    }
});

router.get('/templates/category/:category', async(req, res) => {
    try {
        const { category } = req.params;
        if (!DOCUMENT_CATEGORIES[category]) return res.status(400).json({ success: false, message: 'Invalid category' });
        const templates = [];
        const files = await fsp.readdir(CONTRACTS_DIR);
        for (const file of files) {
            if (file.endsWith('.txt')) {
                let fileCategory = 'platform-agreements';
                const lower = file.toLowerCase();
                if (lower.includes('nda') || lower.includes('confidentiality')) fileCategory = 'confidentiality';
                else if (lower.includes('ip') || lower.includes('intellectual')) fileCategory = 'intellectual-property';
                else if (lower.includes('project') || lower.includes('addendum')) fileCategory = 'project-specific';
                else if (lower.includes('collaboration') || lower.includes('joint')) fileCategory = 'collaboration';
                if (fileCategory === category) {
                    const filePath = path.join(CONTRACTS_DIR, file);
                    const content = await fsp.readFile(filePath, 'utf8');
                    const stats = await fsp.stat(filePath);
                    templates.push({ id: file.replace('.txt', '').toLowerCase().replace(/[^a-z0-9]/g, '-'), title: file.replace('.txt', ''), filename: file, category: fileCategory, categoryInfo: DOCUMENT_CATEGORIES[fileCategory], content, size: stats.size, lastModified: stats.mtime, wordCount: content.split(/\s+/).length, lineCount: content.split('\n').length });
                }
            }
        }
        res.json({ success: true, data: { templates, category: DOCUMENT_CATEGORIES[category], totalTemplates: templates.length } });
    } catch (error) {
        console.error('Error fetching documents by category:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch documents by category', error: error.message });
    }
});

router.get('/search', async(req, res) => {
    try {
        const { q: query, category } = req.query;
        if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });
        const templates = [];
        const files = await fsp.readdir(CONTRACTS_DIR);
        const searchTerm = String(query).toLowerCase();
        for (const file of files) {
            if (file.endsWith('.txt')) {
                const filePath = path.join(CONTRACTS_DIR, file);
                const content = await fsp.readFile(filePath, 'utf8');
                const lower = file.toLowerCase();
                if (lower.includes(searchTerm) || content.toLowerCase().includes(searchTerm)) {
                    const stats = await fsp.stat(filePath);
                    let fileCategory = 'platform-agreements';
                    if (lower.includes('nda') || lower.includes('confidentiality')) fileCategory = 'confidentiality';
                    else if (lower.includes('ip') || lower.includes('intellectual')) fileCategory = 'intellectual-property';
                    else if (lower.includes('project') || lower.includes('addendum')) fileCategory = 'project-specific';
                    else if (lower.includes('collaboration') || lower.includes('joint')) fileCategory = 'collaboration';
                    if (category && fileCategory !== category) continue;
                    templates.push({ id: file.replace('.txt', '').toLowerCase().replace(/[^a-z0-9]/g, '-'), title: file.replace('.txt', ''), filename: file, category: fileCategory, categoryInfo: DOCUMENT_CATEGORIES[fileCategory], content, size: stats.size, lastModified: stats.mtime, wordCount: content.split(/\s+/).length, lineCount: content.split('\n').length });
                }
            }
        }
        res.json({ success: true, data: { templates, query, category: category || 'all', totalResults: templates.length } });
    } catch (error) {
        console.error('Error searching documents:', error);
        res.status(500).json({ success: false, message: 'Failed to search documents', error: error.message });
    }
});

router.get('/stats', async(req, res) => {
    try {
        const files = await fsp.readdir(CONTRACTS_DIR);
        const stats = { totalDocuments: 0, totalSize: 0, totalWords: 0, totalLines: 0, categories: {}, lastModified: null };
        for (const file of files) {
            if (file.endsWith('.txt')) {
                const filePath = path.join(CONTRACTS_DIR, file);
                const content = await fsp.readFile(filePath, 'utf8');
                const fileStats = await fsp.stat(filePath);
                let category = 'platform-agreements';
                const lower = file.toLowerCase();
                if (lower.includes('nda') || lower.includes('confidentiality')) category = 'confidentiality';
                else if (lower.includes('ip') || lower.includes('intellectual')) category = 'intellectual-property';
                else if (lower.includes('project') || lower.includes('addendum')) category = 'project-specific';
                else if (lower.includes('collaboration') || lower.includes('joint')) category = 'collaboration';
                stats.totalDocuments++;
                stats.totalSize += fileStats.size;
                stats.totalWords += content.split(/\s+/).length;
                stats.totalLines += content.split('\n').length;
                if (!stats.categories[category]) stats.categories[category] = 0;
                stats.categories[category]++;
                if (!stats.lastModified || fileStats.mtime > stats.lastModified) stats.lastModified = fileStats.mtime;
            }
        }
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching document statistics:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch document statistics', error: error.message });
    }
});

router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Documents API is healthy', timestamp: new Date().toISOString(), version: '1.0.0' });
});

module.exports = router;