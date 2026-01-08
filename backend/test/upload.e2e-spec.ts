import { createTestApp } from './utils';

async function registerAndLogin(http: any) {
  const email = `u_${Date.now()}@videohub.local`;
  await http.post('/auth/register').send({ email, password: 'password123', displayName: 'Uploader' });
  const loginRes = await http.post('/auth/login').send({ email, password: 'password123' });
  return loginRes.body.accessToken as string;
}

describe('Upload', () => {
  it('uploads a video', async () => {
    const { app, http } = await createTestApp();
    const token = await registerAndLogin(http);

    const res = await http
      .post('/videos/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Test Upload')
      .field('description', 'A test upload')
      .field('tags', JSON.stringify(['test']))
      .field('visibility', 'PUBLIC')
      .attach('file', Buffer.from('fake-video'), {
        filename: 'sample.mp4',
        contentType: 'video/mp4'
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    await app.close();
  });
});
