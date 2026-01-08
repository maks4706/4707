import { createTestApp } from './utils';

async function createVideo(http: any, token: string) {
  await http
    .post('/videos/upload')
    .set('Authorization', `Bearer ${token}`)
    .field('title', 'Feed Video')
    .field('description', 'Video for feed')
    .field('tags', JSON.stringify(['feed']))
    .field('visibility', 'PUBLIC')
    .attach('file', Buffer.from('fake-video'), {
      filename: 'sample.mp4',
      contentType: 'video/mp4'
    });
}

describe('Feed', () => {
  it('returns recommended feed', async () => {
    const { app, http } = await createTestApp();
    const email = `feed_${Date.now()}@videohub.local`;
    await http.post('/auth/register').send({ email, password: 'password123', displayName: 'Feeder' });
    const loginRes = await http.post('/auth/login').send({ email, password: 'password123' });
    const token = loginRes.body.accessToken as string;

    await createVideo(http, token);

    const res = await http.get('/feed/recommended');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    await app.close();
  });
});
