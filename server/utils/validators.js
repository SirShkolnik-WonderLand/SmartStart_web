const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DOMAIN_REGEX = /^[a-z0-9.-]+\.[a-z]{2,}$/;
const CURRENCY_REGEX = /^\d+(\.\d{2})?$/;

function isEmail(value) {
    return EMAIL_REGEX.test(String(value || '').trim());
}

function isIsoDate(value) {
    if (!ISO_DATE_REGEX.test(String(value || '').trim())) return false;
    const d = new Date(value);
    return !isNaN(d.getTime()) && value === value.trim();
}

function isUuidV4(value) {
    return UUID_V4_REGEX.test(String(value || '').trim());
}

function isDomain(value) {
    return DOMAIN_REGEX.test(String(value || '').trim());
}

function isYN(value) {
    return String(value || '').trim().toUpperCase() === 'Y' || String(value || '').trim().toUpperCase() === 'N';
}

function isCurrency(value) {
    return CURRENCY_REGEX.test(String(value || '').trim());
}

function toCentsFromCadString(value) {
    if (!isCurrency(value)) throw new Error('Invalid currency format');
    const [whole, frac = '00'] = String(value).split('.');
    return parseInt(whole, 10) * 100 + parseInt(frac.padEnd(2, '0'), 10);
}

module.exports = {
    isEmail,
    isIsoDate,
    isUuidV4,
    isDomain,
    isYN,
    isCurrency,
    toCentsFromCadString,
    EMAIL_REGEX,
    ISO_DATE_REGEX,
    UUID_V4_REGEX,
    DOMAIN_REGEX,
    CURRENCY_REGEX
};