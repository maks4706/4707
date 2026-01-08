import { createTestApp } from './utils';

describe('Auth', () => {
  it('registers and logs in', async () => {
    const { app, http } = await createTestApp();
    const email = `user_${Date.now()}@videohub.local`;

    const registerRes = await http.post('/auth/register').send({
      email,
      password: 'password123',
      displayName: 'Tester'
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.accessToken).toBeDefined();

    const loginRes = await http.post('/auth/login').send({
      email,
      password: 'password123'
    });

    expect(loginRes.status).toBe(201);
    expect(loginRes.body.accessToken).toBeDefined();
    await app.close();
  });
});
