// server/tests/swipe.test.js
import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import app from '../index';

// Mock the Firestore db for the route
vi.mock('../firebase/firebase', () => {
  return {
    db: {
      collection: vi.fn(() => ({
        add: vi.fn().mockResolvedValue(true),
      })),
    },
  };
});

describe('POST /api/swipe', () => {
  it('returns 400 if required fields are missing', async () => {
    const response = await request(app).post('/api/swipe').send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Missing required fields/i);
  });

  it('records a swipe and returns success when required fields are provided', async () => {
    const payload = { userId: 'user123', homeId: 'home456', action: 'like' };
    const response = await request(app).post('/api/swipe').send(payload);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toMatch(/Swipe recorded/i);
  });
});