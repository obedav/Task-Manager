'use strict';

const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../server');

const VALID_PASSWORD = 'Str0ng#Pass2026!';

let cookies = '';
let taskId  = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const res = await request(app).post('/api/v1/auth/register').send({
    name: 'Task Tester', email: 'tasks@test.com', password: VALID_PASSWORD
  });
  cookies = (res.headers['set-cookie'] || []).join('; ');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('POST /api/v1/tasks', () => {
  it('creates a task', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Cookie', cookies)
      .send({ title: 'Write tests', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.task.title).toBe('Write tests');
    taskId = res.body.task._id;
  });

  it('rejects a task without a title', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Cookie', cookies)
      .send({ priority: 'low' });
    expect(res.status).toBe(400);
  });

  it('returns 401 without authentication', async () => {
    const res = await request(app).post('/api/v1/tasks').send({ title: 'Ghost task' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/tasks', () => {
  it('lists tasks for the authenticated user', async () => {
    const res = await request(app).get('/api/v1/tasks').set('Cookie', cookies);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/v1/tasks?status=pending').set('Cookie', cookies);
    expect(res.status).toBe(200);
    res.body.tasks.forEach((t) => expect(t.status).toBe('pending'));
  });
});

describe('PUT /api/v1/tasks/:id', () => {
  it('updates a task', async () => {
    const res = await request(app)
      .put(`/api/v1/tasks/${taskId}`)
      .set('Cookie', cookies)
      .send({ status: 'in-progress', priority: 'medium' });
    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('in-progress');
  });

  it('returns 404 for a non-existent task', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/v1/tasks/${fakeId}`)
      .set('Cookie', cookies)
      .send({ status: 'completed' });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/v1/tasks/:id/progress', () => {
  it('updates progress', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${taskId}/progress`)
      .set('Cookie', cookies)
      .send({ progress: 75, note: 'Good progress!' });
    expect(res.status).toBe(200);
    expect(res.body.task.progress).toBe(75);
  });

  it('rejects progress outside 0–100', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${taskId}/progress`)
      .set('Cookie', cookies)
      .send({ progress: 150 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/tasks/stats', () => {
  it('returns stats', async () => {
    const res = await request(app).get('/api/v1/tasks/stats').set('Cookie', cookies);
    expect(res.status).toBe(200);
    expect(typeof res.body.stats.total).toBe('number');
  });
});

describe('DELETE /api/v1/tasks/:id', () => {
  it('deletes the task', async () => {
    const res = await request(app).delete(`/api/v1/tasks/${taskId}`).set('Cookie', cookies);
    expect(res.status).toBe(200);
  });

  it('returns 404 after deletion', async () => {
    const res = await request(app).get(`/api/v1/tasks/${taskId}`).set('Cookie', cookies);
    expect(res.status).toBe(404);
  });
});
