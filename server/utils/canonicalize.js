const crypto = require('crypto');

function canonicalizeText(input) {
    const normalized = String(input || '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map(line => line.replace(/\s+$/g, ''))
        .join('\n')
        .replace(/\n{2,}/g, '\n\n');
    return normalized;
}

function sha256Hex(lowercaseText) {
    return crypto.createHash('sha256').update(lowercaseText).digest('hex');
}

function computeDocumentHash(rawText) {
    const canon = canonicalizeText(rawText);
    const hash = sha256Hex(canon);
    return { canonicalText: canon, hash };
}

module.exports = { canonicalizeText, computeDocumentHash };