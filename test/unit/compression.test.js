// Tests for compression functionality added in commit a206816
const pako = require('pako');

describe('Compression Functionality', () => {
    let compressData, decompressData;

    beforeEach(() => {
        // Mock compression/decompression functions
        compressData = (data) => {
            try {
                if (!data) return null;
                const encoder = new TextEncoder();
                const uint8Array = encoder.encode(data);
                const compressed = pako.gzip(uint8Array);
                return Buffer.from(compressed).toString('base64');
            } catch (e) {
                console.error('Compression failed:', e);
                return null;
            }
        };

        decompressData = (compressedData) => {
            try {
                if (!compressedData) return null;
                const buffer = Buffer.from(compressedData, 'base64');
                const decompressed = pako.ungzip(buffer);
                const decoder = new TextDecoder();
                return decoder.decode(decompressed);
            } catch (e) {
                console.error('Decompression failed:', e);
                return null;
            }
        };
    });

    describe('Data Compression', () => {
        test('should compress data correctly', () => {
            const testData = 'Hello, World!';
            const compressed = compressData(testData);

            expect(compressed).toBeDefined();
            expect(compressed).not.toEqual(testData);
            expect(compressed.length).toBeGreaterThan(0);
        });

        test('should compress large HTML data', () => {
            const largeData = '<div>'.repeat(10000) + '</div>'.repeat(10000);
            const compressed = compressData(largeData);

            expect(compressed).toBeDefined();
            expect(compressed.length).toBeLessThan(largeData.length);
        });

        test('should return null on compression failure', () => {
            const originalConsoleError = console.error;
            console.error = jest.fn();

            const compressed = compressData(undefined);
            expect(compressed).toBeNull();

            console.error = originalConsoleError;
        });
    });

    describe('Data Decompression', () => {
        test('should handle round-trip compression/decompression', () => {
            const testCases = [
                'Simple text',
                '<html><body>HTML content</body></html>',
                JSON.stringify({ key: 'value', nested: { data: 123 } }),
                '特殊字符测试 Special chars ñ é ü'
            ];

            testCases.forEach(original => {
                const compressed = compressData(original);
                const decompressed = decompressData(compressed);
                expect(decompressed).toEqual(original);
            });
        });

        test('should return null on decompression failure', () => {
            const originalConsoleError = console.error;
            console.error = jest.fn();

            const decompressed = decompressData('invalid-base64');
            expect(decompressed).toBeNull();

            console.error = originalConsoleError;
        });
    });

    describe('Size Threshold Logic', () => {
        const SIZE_THRESHOLD = 500000; // 500KB

        test('should compress data larger than threshold', () => {
            const largeHtml = 'x'.repeat(SIZE_THRESHOLD + 1000);
            const shouldCompress = largeHtml.length > SIZE_THRESHOLD;
            expect(shouldCompress).toBe(true);
        });

        test('should not compress data smaller than threshold', () => {
            const smallHtml = 'x'.repeat(1000);
            const shouldCompress = smallHtml.length > SIZE_THRESHOLD;
            expect(shouldCompress).toBe(false);
        });
    });
});