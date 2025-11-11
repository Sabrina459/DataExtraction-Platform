import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { fetchDescription } from '../description.js';
import app from '../endpoints.js';

// Mock the description module
vi.mock('./description.js', () => ({
    fetchDescription: vi.fn()
}));

describe('API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/description', () => {
        it('should return description when valid URL is provided', async () => {
            // Mock fetchDescription to return test data
            fetchDescription.mockResolvedValue('Test product description');

            const response = await request(app)
                .post('/api/description')
                .send({ url: 'https://example.com/product' })
                .expect(200);

            expect(response.body).toEqual({ description: 'Test product description' });
            expect(fetchDescription).toHaveBeenCalledWith('https://example.com/product');
        });

        it('should return 400 when URL is missing', async () => {
            const response = await request(app)
                .post('/api/description')
                .send({})
                .expect(400);

            expect(response.body).toEqual({ error: "URL is required" });
            expect(fetchDescription).not.toHaveBeenCalled();
        });

        it('should return 400 when URL is null', async () => {
            const response = await request(app)
                .post('/api/description')
                .send({ url: null })
                .expect(400);

            expect(response.body).toEqual({ error: "URL is required" });
        });

        it('should return 500 when fetchDescription throws an error', async () => {
            // Mock fetchDescription to throw an error
            fetchDescription.mockRejectedValue(new Error('Network error'));

            const response = await request(app)
                .post('/api/description')
                .send({ url: 'https://example.com/product' })
                .expect(500);

            expect(response.body).toEqual({ error: "Failed to fetch description" });
        });

        it('should handle empty description gracefully', async () => {
            // Mock fetchDescription to return empty string
            fetchDescription.mockResolvedValue('');

            const response = await request(app)
                .post('/api/description')
                .send({ url: 'https://example.com/product' })
                .expect(200);

            expect(response.body).toEqual({ description: '' });
        });

        it('should handle empty body gracefully', async () => {
            const response = await request(app)
                .post('/api/description')
                .send()
                .expect(400);

            expect(response.body).toEqual({ error: "URL is required" });
        });
    });
});
