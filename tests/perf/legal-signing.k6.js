import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 50,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<600'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3001';
const TOKEN = __ENV.TOKEN || '';

export default function () {
  const headers = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};

  const docs = http.get(`${BASE}/api/v1/legal/documents`, { headers });
  check(docs, { 'docs 200': (r) => r.status === 200 });

  const sign = http.post(
    `${BASE}/api/v1/legal/documents/ppa/sign`,
    JSON.stringify({ method: 'click', mfa_verified: true }),
    { headers: { ...headers, 'Content-Type': 'application/json' } }
  );
  check(sign, { 'sign 2xx': (r) => r.status >= 200 && r.status < 300 });

  const verify = http.post(
    `${BASE}/api/v1/legal/documents/verify`,
    JSON.stringify({ document_id: 'ppa', signature_hash: 'test' }),
    { headers: { ...headers, 'Content-Type': 'application/json' } }
  );
  check(verify, { 'verify 2xx/4xx': (r) => r.status === 200 || r.status === 400 });

  sleep(1);
}
