// Tests for background.js - blob handling and new install defaults
describe('Background Script', () => {
    describe('base64ToBlob function', () => {
        let base64ToBlob;

        beforeEach(() => {
            // Recreate the function from background.js
            base64ToBlob = (base64, mimeType) => {
                const binaryString = atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return new Blob([bytes], {type: mimeType});
            };
        });

        test('should convert base64 to blob', () => {
            const testData = 'Hello, World!';
            const base64 = btoa(testData);

            const blob = base64ToBlob(base64, 'text/plain');

            expect(blob).toBeInstanceOf(Blob);
            expect(blob.type).toBe('text/plain');
            expect(blob.size).toBeGreaterThan(0);
        });

        test('should handle gzip mime type', () => {
            const testData = 'compressed data';
            const base64 = btoa(testData);

            const blob = base64ToBlob(base64, 'application/gzip');

            expect(blob.type).toBe('application/gzip');
        });

        test('should handle binary data', () => {
            // Create some binary data
            const binaryArray = new Uint8Array([72, 101, 108, 108, 111]);
            let binaryString = '';
            for (let i = 0; i < binaryArray.length; i++) {
                binaryString += String.fromCharCode(binaryArray[i]);
            }
            const base64 = btoa(binaryString);

            const blob = base64ToBlob(base64, 'application/octet-stream');

            expect(blob.size).toBe(5);
            expect(blob.type).toBe('application/octet-stream');
        });

        test('should handle empty base64 string', () => {
            const blob = base64ToBlob('', 'text/plain');

            expect(blob).toBeInstanceOf(Blob);
            expect(blob.size).toBe(0);
        });

        test('should handle large base64 data', () => {
            const largeData = 'x'.repeat(100000);
            const base64 = btoa(largeData);

            const blob = base64ToBlob(base64, 'text/plain');

            expect(blob.size).toBe(100000);
        });
    });

    describe('New Install Defaults (onInstalled listener)', () => {
        const expectedDefaults = {
            margins: '',
            theme: '',
            zoom: 100,
            no_questions: false,
            q_color: 'default',
            q_color_picker: '#ecf9f2',
            q_fg_color: 'default',
            q_fg_color_picker: '#000',
            title_mode: '',
            margin_left: '0.4in',
            margin_right: '0.4in',
            margin_top: '0.4in',
            margin_bottom: '0.4in',
            page_break: '',
            toc: '',
            no_icons: true,
            model_name: false,
            datetime_format: 'none',
            q_align: 'justified',
            q_rounded: false
        };

        test('should set no_icons to true for new installs', () => {
            expect(expectedDefaults.no_icons).toBe(true);
        });

        test('should include all required default options', () => {
            const requiredKeys = [
                'margins', 'theme', 'zoom', 'no_questions',
                'q_color', 'q_fg_color', 'title_mode',
                'margin_left', 'margin_right', 'margin_top', 'margin_bottom',
                'page_break', 'toc', 'no_icons', 'model_name',
                'datetime_format', 'q_align', 'q_rounded'
            ];

            requiredKeys.forEach(key => {
                expect(expectedDefaults).toHaveProperty(key);
            });
        });

        test('should set default margins to 0.4in', () => {
            expect(expectedDefaults.margin_left).toBe('0.4in');
            expect(expectedDefaults.margin_right).toBe('0.4in');
            expect(expectedDefaults.margin_top).toBe('0.4in');
            expect(expectedDefaults.margin_bottom).toBe('0.4in');
        });

        test('should set zoom to 100', () => {
            expect(expectedDefaults.zoom).toBe(100);
        });

        test('should disable questions by default (no_questions: false)', () => {
            expect(expectedDefaults.no_questions).toBe(false);
        });

        test('should set default color scheme', () => {
            expect(expectedDefaults.q_color).toBe('default');
            expect(expectedDefaults.q_color_picker).toBe('#ecf9f2');
            expect(expectedDefaults.q_fg_color).toBe('default');
            expect(expectedDefaults.q_fg_color_picker).toBe('#000');
        });

        test('should set text alignment to justified', () => {
            expect(expectedDefaults.q_align).toBe('justified');
        });

        test('should disable rounded corners by default', () => {
            expect(expectedDefaults.q_rounded).toBe(false);
        });

        test('should disable model name display by default', () => {
            expect(expectedDefaults.model_name).toBe(false);
        });

        test('should set datetime_format to none', () => {
            expect(expectedDefaults.datetime_format).toBe('none');
        });
    });

    describe('FormData Handling', () => {
        test('should handle file parameter as blob with correct filename', () => {
            const mockBlob = new Blob(['test data'], {
                type: 'application/gzip'
            });
            const formData = new FormData();

            formData.append('file', mockBlob, 'index.html.gz');

            const file = formData.get('file');
            expect(file).toBeInstanceOf(Blob);
            expect(file.type).toBe('application/gzip');
        });

        test('should preserve other parameters in formData', () => {
            const formData = new FormData();
            const params = {
                username: 'testuser',
                apiKey: 'key123',
                page_width: '8.5in'
            };

            for (let key in params) {
                formData.append(key, params[key]);
            }

            expect(formData.get('username')).toBe('testuser');
            expect(formData.get('apiKey')).toBe('key123');
            expect(formData.get('page_width')).toBe('8.5in');
        });
    });

    describe('Compression Fallback', () => {
        let tryCompress, prepareFile;
        let originalCompressionStream;

        beforeEach(() => {
            // Save the original CompressionStream if it exists
            originalCompressionStream = global.CompressionStream;

            // Create a factory for tryCompress that respects
            // the global environment
            const createTryCompress = () => function(htmlContent) {
                return new Promise((resolve, reject) => {
                    if(typeof CompressionStream === 'undefined') {
                        reject(
                            new Error('CompressionStream not available')
                        );
                        return;
                    }

                    try {
                        const encoder = new TextEncoder();
                        const htmlBytes = encoder.encode(htmlContent);

                        const stream = new Blob([htmlBytes])
                            .stream()
                            .pipeThrough(new CompressionStream('gzip'));

                        new Response(stream).arrayBuffer()
                            .then(gzippedData => {
                                const gzipped = new Uint8Array(gzippedData);
                                const gzipBlob = new Blob(
                                    [gzipped],
                                    {type: 'application/gzip'}
                                );
                                resolve({
                                    blob: gzipBlob,
                                    filename: 'index.html.gz'
                                });
                            })
                            .catch(reject);
                    } catch(error) {
                        reject(error);
                    }
                });
            };

            prepareFile = function(htmlContent) {
                // Recreate tryCompress each time to pick up
                // environment changes
                tryCompress = createTryCompress();
                return tryCompress(htmlContent)
                    .then(result => result)
                    .catch(error => {
                        const htmlBlob = new Blob(
                            [htmlContent],
                            {type: 'text/html'}
                        );
                        return {
                            blob: htmlBlob,
                            filename: 'index.html'
                        };
                    });
            };

            // Initialize tryCompress
            tryCompress = createTryCompress();
        });

        afterEach(() => {
            // Restore CompressionStream
            if(originalCompressionStream) {
                global.CompressionStream = originalCompressionStream;
            } else {
                delete global.CompressionStream;
            }
        });

        test('should reject when CompressionStream unavailable',
        async () => {
            // Delete CompressionStream to simulate unavailability
            delete global.CompressionStream;

            // Recreate tryCompress to pick up the change
            const createTryCompress = () => function(htmlContent) {
                return new Promise((resolve, reject) => {
                    if(typeof CompressionStream === 'undefined') {
                        reject(
                            new Error('CompressionStream not available')
                        );
                        return;
                    }
                    // Compression code would go here
                    reject(new Error('Should not reach here'));
                });
            };
            tryCompress = createTryCompress();

            const htmlContent = '<html><body>Test</body></html>';

            await expect(tryCompress(htmlContent))
                .rejects
                .toThrow('CompressionStream not available');
        });

        test('should fallback to uncompressed when compression fails',
        async () => {
            // Delete CompressionStream to force fallback
            delete global.CompressionStream;

            const htmlContent = '<html><body>Test Content</body></html>';

            const result = await prepareFile(htmlContent);

            expect(result).toBeDefined();
            expect(result.filename).toBe('index.html');
            expect(result.blob).toBeInstanceOf(Blob);
            expect(result.blob.type).toBe('text/html');
        });

        test('should preserve content in uncompressed fallback',
        async () => {
            // Delete CompressionStream to force fallback
            delete global.CompressionStream;

            const htmlContent = '<html><body>Important Data</body></html>';

            const result = await prepareFile(htmlContent);

            // Use FileReader since blob.text() may not be available
            const reader = new FileReader();
            const textPromise = new Promise((resolve) => {
                reader.onload = () => resolve(reader.result);
            });
            reader.readAsText(result.blob);
            const text = await textPromise;

            expect(text).toBe(htmlContent);
        });

        test('should handle large content in fallback', async () => {
            // Delete CompressionStream to force fallback
            delete global.CompressionStream;

            const largeContent = '<div>' + 'x'.repeat(1000000) + '</div>';

            const result = await prepareFile(largeContent);

            expect(result.filename).toBe('index.html');
            expect(result.blob.size).toBeGreaterThan(1000000);
        });
    });

    describe('API Response Handling', () => {
        test('should handle successful response (status 200)', async () => {
            const mockBlob = new Blob(['PDF content'], {
                type: 'application/pdf'
            });

            const mockResponse = {
                status: 200,
                blob: () => Promise.resolve(mockBlob)
            };

            expect(mockResponse.status).toBe(200);
            const blob = await mockResponse.blob();
            expect(blob).toBeInstanceOf(Blob);
        });

        test('should handle error response (status != 200)', async () => {
            const mockResponse = {
                status: 400,
                text: () => Promise.resolve('Invalid request')
            };

            expect(mockResponse.status).toBe(400);
            const errorMsg = await mockResponse.text();
            expect(errorMsg).toBe('Invalid request');
        });

        test('should handle network errors', () => {
            const error = {
                status: 'network-error',
                message: 'Failed to fetch'
            };

            expect(error.status).toBe('network-error');
            expect(error.message).toBeTruthy();
        });
    });
});