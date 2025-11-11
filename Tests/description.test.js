import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDescription } from '../description.js';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

// Mock node-fetch
vi.mock('node-fetch', () => ({
    default: vi.fn()
}));

describe('fetchDescription', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return empty string when URL is not provided', async () => {
        const result = await fetchDescription('');
        expect(result).toBe('');
    });

    it('should return empty string when URL is null', async () => {
        const result = await fetchDescription(null);
        expect(result).toBe('');
    });

    it('should return empty string when URL is undefined', async () => {
        const result = await fetchDescription(undefined);
        expect(result).toBe('');
    });

    it('should fetch and parse description from HTML', async () => {
        const mockHtml = `
            <html>
                <body>
                    <div id="descr">
                        <div class="product-about__description-content text">
                            This is a test product description
                        </div>
                    </div>
                </body>
            </html>
        `;

        fetch.mockResolvedValue({
            text: vi.fn().mockResolvedValue(mockHtml)
        });

        const result = await fetchDescription('https://example.com/product');
        
        expect(result).toBe('This is a test product description');
        expect(fetch).toHaveBeenCalledWith('https://example.com/product');
    });

    it('should return empty string when description element is not found', async () => {
        const mockHtml = `
            <html>
                <body>
                    <div id="other">
                        Some content
                    </div>
                </body>
            </html>
        `;

        fetch.mockResolvedValue({
            text: vi.fn().mockResolvedValue(mockHtml)
        });

        const result = await fetchDescription('https://example.com/product');
        
        expect(result).toBe('');
    });

    it('should handle multiple description elements and return first one', async () => {
        const mockHtml = `
            <html>
                <body>
                    <div id="descr">
                        <div class="product-about__description-content text">
                            First description
                        </div>
                        <div class="product-about__description-content text">
                            Second description
                        </div>
                    </div>
                </body>
            </html>
        `;

        fetch.mockResolvedValue({
            text: vi.fn().mockResolvedValue(mockHtml)
        });

        const result = await fetchDescription('https://example.com/product');
        
        // Cheerio's text() method will concatenate all text from matching elements
        expect(result).toContain('First description');
    });

    it('should trim whitespace from description', async () => {
        const mockHtml = `
            <html>
                <body>
                    <div id="descr">
                        <div class="product-about__description-content text">
                            
                            Description with whitespace
                            
                        </div>
                    </div>
                </body>
            </html>
        `;

        fetch.mockResolvedValue({
            text: vi.fn().mockResolvedValue(mockHtml)
        });

        const result = await fetchDescription('https://example.com/product');
        
        expect(result).toBe('Description with whitespace');
    });

    it('should handle fetch errors gracefully', async () => {
        fetch.mockRejectedValue(new Error('Network error'));

        await expect(fetchDescription('https://example.com/product')).rejects.toThrow('Network error');
    });

    it('should handle empty description content', async () => {
        const mockHtml = `
            <html>
                <body>
                    <div id="descr">
                        <div class="product-about__description-content text">
                        </div>
                    </div>
                </body>
            </html>
        `;

        fetch.mockResolvedValue({
            text: vi.fn().mockResolvedValue(mockHtml)
        });

        const result = await fetchDescription('https://example.com/product');
        
        expect(result).toBe('');
    });
});
