const fetch = require('node-fetch');

const BASE = process.env.BASE_URL || 'http://localhost:3001';

describe('Post-deploy smoke', () => {
  it('GET /health or /api/status responds', async () => {
    let res = await fetch(`${BASE}/api/status`).catch(() => null);
    if (!res || !res.ok) {
      res = await fetch(`${BASE}/health`).catch(() => null);
    }
    expect(res && res.ok).toBe(true);
  }, 15000);

  it('Legal documents list responds', async () => {
    const res = await fetch(`${BASE}/api/v1/legal/documents`);
    expect([200, 401, 403]).toContain(res.status);
  }, 15000);
});
