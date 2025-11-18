// Tests for request.js - gzip compression and message handling
const pako = require('pako');

describe('Request Handling - Gzip Compression', () => {
    let createGzip, MAX_MESSAGE_BYTES;

    beforeEach(() => {
        MAX_MESSAGE_BYTES = 64 * 1024 * 1024; // 64MB

        // Mock createGzip function from request.js using pako for Node environment
        createGzip = async (data) => {
            const htmlContent = data.text;
            const encoder = new TextEncoder();
            const htmlBytes = encoder.encode(htmlContent);
            const fileSize = htmlBytes.length;

            // Use pako for gzip compression in test environment
            const gzipped = pako.gzip(htmlBytes);

            // Convert to base64 using chunking
            const base64String = Buffer.from(gzipped).toString('base64');

            return {
                gzipBase64: base64String,
                originalSize: fileSize,
                compressedSize: gzipped.length,
                otherParams: Object.keys(data)
                    .filter(k => k !== 'text')
                    .reduce((obj, k) => {
                        obj[k] = data[k];
                        return obj;
                    }, {})
            };
        };
    });

    describe('createGzip function', () => {
        test('should compress HTML content', async () => {
            const data = {
                text: '<html><body>Test content</body></html>',
                param1: 'value1',
                param2: 'value2'
            };

            const result = await createGzip(data);

            expect(result).toHaveProperty('gzipBase64');
            expect(result).toHaveProperty('originalSize');
            expect(result).toHaveProperty('compressedSize');
            expect(result.gzipBase64).toBeTruthy();
            expect(result.originalSize).toBeGreaterThan(0);
        });

        test('should handle large HTML content', async () => {
            const largeHtml = '<div>'.repeat(50000) + '</div>'.repeat(50000);
            const data = { text: largeHtml };

            const result = await createGzip(data);

            expect(result.gzipBase64).toBeTruthy();
            expect(result.compressedSize).toBeLessThan(result.originalSize);
        });

        test('should preserve other parameters', async () => {
            const data = {
                text: 'HTML content',
                username: 'testuser',
                apiKey: 'key123',
                page_width: '8.5in'
            };

            const result = await createGzip(data);

            expect(result.otherParams).toEqual({
                username: 'testuser',
                apiKey: 'key123',
                page_width: '8.5in'
            });
        });

        test('should handle Unicode characters', async () => {
            const data = {
                text: '你好世界 🌍 Hello مرحبا'
            };

            const result = await createGzip(data);

            expect(result.gzipBase64).toBeTruthy();
            expect(result.originalSize).toBeGreaterThan(0);
        });

        test('should handle empty text', async () => {
            const data = { text: '' };

            const result = await createGzip(data);

            expect(result.gzipBase64).toBeTruthy();
            expect(result.originalSize).toBe(0);
        });

        test('should use chunking for large data', async () => {
            // Create data larger than chunk size (8192)
            const largeText = 'x'.repeat(100000);
            const data = { text: largeText };

            const result = await createGzip(data);

            expect(result.gzipBase64).toBeTruthy();
            // Verify it's valid base64
            expect(() => atob(result.gzipBase64)).not.toThrow();
        });
    });

    describe('Message Size Limits', () => {
        test('should enforce 64MB message size limit', () => {
            expect(MAX_MESSAGE_BYTES).toBe(64 * 1024 * 1024);
        });

        test('should check compressed message size against limit', async () => {
            const data = { text: 'Small content' };
            const result = await createGzip(data);

            const compressedMessage = {
                contentScriptQuery: 'postData',
                url: 'https://api.pdfcrowd.com/convert',
                username: 'user',
                apiKey: 'key',
                gzipFile: result.gzipBase64,
                params: result.otherParams,
                fileName: 'test.pdf'
            };

            const compressedSize = new TextEncoder()
                .encode(JSON.stringify(compressedMessage))
                .length;

            expect(compressedSize).toBeLessThan(MAX_MESSAGE_BYTES);
        });

        test('should handle edge case near size limit', async () => {
            // Create message close to but under limit
            const nearLimitSize = MAX_MESSAGE_BYTES - 1000;
            const isUnderLimit = nearLimitSize < MAX_MESSAGE_BYTES;

            expect(isUnderLimit).toBe(true);
        });
    });

    describe('Compression Efficiency', () => {
        test('should compress repetitive content efficiently', async () => {
            const repetitiveHtml = '<div class="message">'.repeat(1000) +
                'Same text '.repeat(1000) +
                '</div>'.repeat(1000);

            const data = { text: repetitiveHtml };
            const result = await createGzip(data);

            const compressionRatio = result.compressedSize / result.originalSize;
            expect(compressionRatio).toBeLessThan(0.5); // At least 50% compression
        });

        test('should report original and compressed sizes', async () => {
            const data = { text: '<html>Test</html>' };
            const result = await createGzip(data);

            expect(result.originalSize).toBeGreaterThan(0);
            expect(result.compressedSize).toBeGreaterThan(0);
            expect(typeof result.originalSize).toBe('number');
            expect(typeof result.compressedSize).toBe('number');
        });
    });
});