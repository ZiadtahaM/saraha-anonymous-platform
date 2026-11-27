import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_SECRET = 'test-secret';
process.env.FINGERPRINT_SECRET = 'test-fp';

let mongod, app, token;
const creds = { username: 'ziad', email: 'ziad@example.com', password: 'password123' };

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  const { createApp } = await import('../src/app.js');
  app = createApp();
});
after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test('register rejects a short password', async () => {
  const res = await request(app).post('/api/auth/register').send({ ...creds, password: 'x' });
  assert.equal(res.status, 400);
});

test('register, duplicate and login', async () => {
  assert.equal((await request(app).post('/api/auth/register').send(creds)).status, 201);
  assert.equal((await request(app).post('/api/auth/register').send(creds)).status, 409);
  const bad = await request(app).post('/api/auth/login').send({ email: creds.email, password: 'wrongpass1' });
  assert.equal(bad.status, 401);
  const ok = await request(app).post('/api/auth/login').send({ email: creds.email, password: creds.password });
  assert.equal(ok.status, 200);
  token = ok.body.token;
});

test('inbox requires a token', async () => {
  assert.equal((await request(app).get('/api/messages')).status, 401);
});

test('anyone can send anonymously and the owner reads it without sender data', async () => {
  const sent = await request(app).post('/api/users/ziad/messages').send({ content: 'you are great' });
  assert.equal(sent.status, 201);
  const inbox = await request(app).get('/api/messages').set('Authorization', `Bearer ${token}`);
  assert.equal(inbox.body.total, 1);
  assert.equal(inbox.body.items[0].content, 'you are great');
  assert.equal(inbox.body.items[0].senderFingerprint, undefined);
});

test('empty message is rejected', async () => {
  const res = await request(app).post('/api/users/ziad/messages').send({ content: '   ' });
  assert.equal(res.status, 400);
});

test('answer publishes on the public profile', async () => {
  const inbox = await request(app).get('/api/messages').set('Authorization', `Bearer ${token}`);
  const id = inbox.body.items[0]._id;
  const r = await request(app).post(`/api/messages/${id}/answer`).set('Authorization', `Bearer ${token}`).send({ answer: 'thanks' });
  assert.equal(r.status, 200);
  const profile = await request(app).get('/api/users/ziad');
  assert.equal(profile.body.answers[0].answer, 'thanks');
});

test('closed inbox refuses messages', async () => {
  await request(app).patch('/api/users/me/settings').set('Authorization', `Bearer ${token}`).send({ acceptingMessages: false });
  const res = await request(app).post('/api/users/ziad/messages').send({ content: 'hi' });
  assert.equal(res.status, 403);
  await request(app).patch('/api/users/me/settings').set('Authorization', `Bearer ${token}`).send({ acceptingMessages: true });
});

test('blocking a sender stops further messages', async () => {
  const inbox = await request(app).get('/api/messages').set('Authorization', `Bearer ${token}`);
  const id = inbox.body.items[0]._id;
  assert.equal((await request(app).post(`/api/messages/${id}/block`).set('Authorization', `Bearer ${token}`)).status, 200);
  const res = await request(app).post('/api/users/ziad/messages').send({ content: 'again' });
  assert.equal(res.status, 403);
});

test('delete account removes the user', async () => {
  assert.equal((await request(app).delete('/api/users/me').set('Authorization', `Bearer ${token}`)).status, 204);
  assert.equal((await request(app).get('/api/users/ziad')).status, 404);
});
