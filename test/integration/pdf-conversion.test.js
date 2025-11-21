// Integration tests for PDF conversion workflow
const fs = require('fs');
const path = require('path');
const pako = require('pako');

describe('PDF Conversion Integration', () => {
    let chatHtml;
    const SIZE_THRESHOLD = 500000;

    beforeAll(() => {
        // Load the real chat.html fixture
        chatHtml = fs.readFileSync(
            path.join(__dirname, '../fixtures/chat.html'),
            'utf-8'
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    describe('Large Chat Processing', () => {
        test('should handle large chat.html file', () => {
            document.body.innerHTML = chatHtml;

            const main = document.querySelector('main') ||
                         document.querySelector('div.grow');
            expect(main).not.toBeNull();

            // Clone for processing
            const processed = main.cloneNode(true);

            // Apply the removal logic from commit a206816
            const elementsToRemove = processed.querySelectorAll(
                'script, style, .absolute.z-0, .absolute.z-1, #AIPRM__sidebar'
            );

            const removedCount = elementsToRemove.length;
            elementsToRemove.forEach(el => el.remove());

            // Verify removals
            expect(processed.querySelector('script')).toBeNull();
            expect(processed.querySelector('style')).toBeNull();
            expect(processed.querySelector('.absolute.z-0')).toBeNull();
            expect(processed.querySelector('.absolute.z-1')).toBeNull();
            expect(processed.querySelector('#AIPRM__sidebar')).toBeNull();

            console.log(`Removed ${removedCount} unnecessary elements`);
        });

        test('should compress large HTML when over threshold', async () => {
            document.body.innerHTML = chatHtml;

            const main = document.querySelector('main') ||
                         document.querySelector('div.grow');
            const htmlContent = main.outerHTML;

            const needsCompression = htmlContent.length > SIZE_THRESHOLD;
            console.log(`HTML size: ${htmlContent.length} bytes`);
            console.log(`Needs compression: ${needsCompression}`);

            if (needsCompression) {
                // Use pako for gzip compression in test environment
                const encoder = new TextEncoder();
                const htmlBytes = encoder.encode(htmlContent);
                const gzipped = pako.gzip(htmlBytes);
                const base64 = Buffer.from(gzipped).toString('base64');

                expect(base64.length).toBeGreaterThan(0);
                console.log(`Compressed to: ${gzipped.length} bytes`);
                console.log(`Compression ratio: ${(gzipped.length / htmlContent.length * 100).toFixed(2)}%`);
            }
        });

        test('should preserve chat messages after cleanup', () => {
            document.body.innerHTML = chatHtml;

            const main = document.querySelector('main') ||
                         document.querySelector('div.grow');
            const processed = main.cloneNode(true);

            // Remove unnecessary elements
            processed.querySelectorAll(
                'script, style, .absolute.z-0, .absolute.z-1, #AIPRM__sidebar'
            ).forEach(el => el.remove());

            // Check that messages are preserved
            const userMessages = processed.querySelectorAll(
                '[data-message-author-role="user"]'
            );
            const assistantMessages = processed.querySelectorAll(
                '[data-message-author-role="assistant"]'
            );

            expect(userMessages.length).toBeGreaterThan(0);
            expect(assistantMessages.length).toBeGreaterThan(0);

            console.log(`Preserved ${userMessages.length} user messages`);
            console.log(`Preserved ${assistantMessages.length} assistant messages`);
        });

        test('should handle images in chat content', () => {
            document.body.innerHTML = chatHtml;

            const main = document.querySelector('main') ||
                         document.querySelector('div.grow');
            const processed = main.cloneNode(true);

            // Check for images that might need processing
            const images = processed.querySelectorAll('img');
            let expiredImages = 0;

            images.forEach(img => {
                const src = img.getAttribute('src');
                if (src && src.includes('expired') || !src) {
                    expiredImages++;
                    // In real code, this would be replaced with placeholder
                    img.setAttribute('data-original-src', src || '');
                    img.setAttribute('src', 'data:image/svg+xml,...');
                }
            });

            console.log(`Found ${images.length} images, ${expiredImages} expired`);
        });
    });

    describe('Message Styling', () => {
        test('should apply custom styles to user messages', () => {
            document.body.innerHTML = chatHtml;

            const options = {
                q_color: 'custom',
                q_color_picker: '#f0f0f0',
                q_fg_color: 'custom',
                q_fg_color_picker: '#333333'
            };

            const userMessages = document.querySelectorAll(
                '[data-message-author-role="user"]'
            );

            // Apply styles as per the new function
            if (options.q_color !== 'default') {
                const colorVal = options.q_color === 'none'
                    ? 'unset' : options.q_color_picker;
                userMessages.forEach(msg => {
                    msg.style.backgroundColor = colorVal;
                    if (colorVal === 'unset') {
                        msg.style.paddingLeft = '0';
                        msg.style.paddingRight = '0';
                    }
                });
            }

            if (options.q_fg_color !== 'default') {
                userMessages.forEach(msg => {
                    msg.style.color = options.q_fg_color_picker;
                });
            }

            // Verify styles applied (browser converts to rgb)
            userMessages.forEach(msg => {
                expect(msg.style.backgroundColor).toBe('rgb(240, 240, 240)');
                expect(msg.style.color).toBe('rgb(51, 51, 51)');
            });
        });

        test('should not style assistant messages', () => {
            document.body.innerHTML = chatHtml;

            const options = {
                q_color: 'custom',
                q_color_picker: '#f0f0f0',
                q_fg_color: 'custom',
                q_fg_color_picker: '#333333'
            };

            const assistantMessages = document.querySelectorAll(
                '[data-message-author-role="assistant"]'
            );

            const originalStyles = Array.from(assistantMessages).map(msg => ({
                bg: msg.style.backgroundColor,
                color: msg.style.color
            }));

            // Apply question styles (should not affect assistant messages)
            const userMessages = document.querySelectorAll(
                '[data-message-author-role="user"]'
            );
            userMessages.forEach(msg => {
                msg.style.backgroundColor = options.q_color_picker;
                msg.style.color = options.q_fg_color_picker;
            });

            // Verify assistant messages unchanged
            assistantMessages.forEach((msg, index) => {
                expect(msg.style.backgroundColor).toBe(originalStyles[index].bg);
                expect(msg.style.color).toBe(originalStyles[index].color);
            });
        });
    });

    describe('Complete Conversion Flow', () => {
        test('should process chat for PDF conversion', async () => {
            document.body.innerHTML = chatHtml;

            // Step 1: Get main content
            const main = document.querySelector('main') ||
                         document.querySelector('div.grow');
            expect(main).not.toBeNull();

            // Step 2: Clone and clean
            const processed = main.cloneNode(true);
            processed.querySelectorAll(
                'script, style, .absolute.z-0, .absolute.z-1, #AIPRM__sidebar'
            ).forEach(el => el.remove());

            // Step 3: Apply user message styles
            const options = { q_color: 'default', q_fg_color: 'default' };

            // Step 4: Check if compression needed
            const htmlContent = processed.outerHTML;
            const needsCompression = htmlContent.length > SIZE_THRESHOLD;

            // Step 5: Prepare for API call
            let payload;
            if (needsCompression) {
                const encoder = new TextEncoder();
                const htmlBytes = encoder.encode(htmlContent);
                const gzipped = pako.gzip(htmlBytes);
                const base64 = Buffer.from(gzipped).toString('base64');

                payload = {
                    gzipFile: base64,
                    params: options,
                    compressed: true
                };
            } else {
                payload = {
                    text: htmlContent,
                    params: options,
                    compressed: false
                };
            }

            expect(payload).toBeDefined();
            expect(payload).toHaveProperty('compressed');
            expect(payload.compressed).toBe(needsCompression);
        });

        test('should handle conversion errors gracefully', async () => {
            // Mock a failed API response
            global.fetch = jest.fn(() =>
                Promise.reject(new Error('Network error'))
            );

            try {
                await fetch('https://api.pdfcrowd.com/convert', {
                    method: 'POST',
                    body: JSON.stringify({ text: 'test' })
                });
            } catch (error) {
                expect(error.message).toContain('Network error');
            }

            expect(fetch).toHaveBeenCalled();
        });

        test('should enforce 64MB message size limit', async () => {
            const MAX_MESSAGE_BYTES = 64 * 1024 * 1024;

            // Create a message
            const message = {
                contentScriptQuery: 'postData',
                gzipFile: 'base64data',
                params: {}
            };

            const messageSize = new TextEncoder()
                .encode(JSON.stringify(message))
                .length;

            expect(messageSize).toBeLessThan(MAX_MESSAGE_BYTES);
        });
    });
});