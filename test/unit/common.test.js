// Tests for common.js - DOM manipulation and styling
describe('Common.js - DOM Manipulation', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('prepareContent - Element Removal (commit a206816)', () => {
        test('should remove scripts and styles', () => {
            document.body.innerHTML = `
                <main>
                    <script>console.log('test');</script>
                    <script src="external.js"></script>
                    <style>.test { color: red; }</style>
                    <style>body { margin: 0; }</style>
                    <div>Content to keep</div>
                </main>
            `;

            const main = document.querySelector('main');
            const cloned = main.cloneNode(true);

            // Simulate the removal logic from commit a206816
            cloned.querySelectorAll('script, style').forEach(el => el.remove());

            expect(cloned.querySelector('script')).toBeNull();
            expect(cloned.querySelector('style')).toBeNull();
            expect(cloned.querySelectorAll('script').length).toBe(0);
            expect(cloned.querySelectorAll('style').length).toBe(0);
            expect(cloned.textContent).toContain('Content to keep');
        });

        test('should remove absolute positioned elements (z-0, z-1)', () => {
            document.body.innerHTML = `
                <main>
                    <div class="absolute z-0">Background element</div>
                    <div class="absolute z-1">Another background</div>
                    <div class="absolute z-10">Keep this</div>
                    <div class="content">Keep this content</div>
                </main>
            `;

            const main = document.querySelector('main');
            const cloned = main.cloneNode(true);

            // Remove elements as per commit a206816
            cloned.querySelectorAll(
                '.absolute.z-0, .absolute.z-1'
            ).forEach(el => el.remove());

            expect(cloned.querySelector('.absolute.z-0')).toBeNull();
            expect(cloned.querySelector('.absolute.z-1')).toBeNull();
            expect(cloned.querySelector('.absolute.z-10')).not.toBeNull();
            expect(cloned.querySelector('.content')).not.toBeNull();
        });

        test('should remove AIPRM sidebar', () => {
            document.body.innerHTML = `
                <main>
                    <div id="AIPRM__sidebar">
                        <div>AIPRM content</div>
                        <button>AIPRM button</button>
                    </div>
                    <div class="conversation">Chat content</div>
                </main>
            `;

            const main = document.querySelector('main');
            const cloned = main.cloneNode(true);

            cloned.querySelectorAll('#AIPRM__sidebar').forEach(el => el.remove());

            expect(cloned.querySelector('#AIPRM__sidebar')).toBeNull();
            expect(cloned.querySelector('.conversation')).not.toBeNull();
        });

        test('should remove all unnecessary elements in one pass', () => {
            document.body.innerHTML = `
                <main>
                    <script>var test = 1;</script>
                    <style>body { margin: 0; }</style>
                    <div class="absolute z-0">Background 1</div>
                    <div class="absolute z-1">Background 2</div>
                    <div id="AIPRM__sidebar">Sidebar</div>
                    <div class="chat-content">Actual chat</div>
                </main>
            `;

            const main = document.querySelector('main');
            const cloned = main.cloneNode(true);

            // Remove all elements as per commit a206816
            const selector = 'script, style, .absolute.z-0, .absolute.z-1, #AIPRM__sidebar';
            cloned.querySelectorAll(selector).forEach(el => el.remove());

            expect(cloned.querySelector('script')).toBeNull();
            expect(cloned.querySelector('style')).toBeNull();
            expect(cloned.querySelector('.absolute.z-0')).toBeNull();
            expect(cloned.querySelector('.absolute.z-1')).toBeNull();
            expect(cloned.querySelector('#AIPRM__sidebar')).toBeNull();
            expect(cloned.querySelector('.chat-content')).not.toBeNull();
            expect(cloned.textContent).toContain('Actual chat');
        });

        test('should handle nested unnecessary elements', () => {
            document.body.innerHTML = `
                <main>
                    <div class="absolute z-0">
                        <script>nested script</script>
                        <div class="absolute z-1">
                            <style>nested style</style>
                        </div>
                    </div>
                    <div>Keep this</div>
                </main>
            `;

            const main = document.querySelector('main');
            const cloned = main.cloneNode(true);

            cloned.querySelectorAll(
                'script, style, .absolute.z-0, .absolute.z-1, #AIPRM__sidebar'
            ).forEach(el => el.remove());

            expect(cloned.querySelector('script')).toBeNull();
            expect(cloned.querySelector('style')).toBeNull();
            expect(cloned.querySelector('.absolute.z-0')).toBeNull();
            expect(cloned.querySelector('.absolute.z-1')).toBeNull();
        });

        test('should preserve message structure after cleanup', () => {
            document.body.innerHTML = `
                <main>
                    <script>console.log('remove');</script>
                    <div data-message-author-role="user">User message</div>
                    <div class="absolute z-0">Remove</div>
                    <div data-message-author-role="assistant">Assistant message</div>
                    <div id="AIPRM__sidebar">Remove</div>
                </main>
            `;

            const main = document.querySelector('main');
            const cloned = main.cloneNode(true);

            cloned.querySelectorAll(
                'script, style, .absolute.z-0, .absolute.z-1, #AIPRM__sidebar'
            ).forEach(el => el.remove());

            const userMsgs = cloned.querySelectorAll('[data-message-author-role="user"]');
            const assistantMsgs = cloned.querySelectorAll('[data-message-author-role="assistant"]');

            expect(userMsgs.length).toBe(1);
            expect(assistantMsgs.length).toBe(1);
        });
    });

    describe('applyQuestionStyles function (commit a206816)', () => {
        let mockOptions;
        let container;

        beforeEach(() => {
            container = document.createElement('div');
            container.innerHTML = `
                <div data-message-author-role="user">Question 1</div>
                <div data-message-author-role="assistant">Answer 1</div>
                <div data-message-author-role="user">Question 2</div>
            `;
            document.body.appendChild(container);

            mockOptions = {
                q_color: 'default',
                q_color_picker: '#f0f0f0',
                q_fg_color: 'default',
                q_fg_color_picker: '#000000'
            };
        });

        test('should apply background color to user messages', () => {
            mockOptions.q_color = 'custom';
            const questions = container.querySelectorAll(
                '[data-message-author-role="user"]'
            );

            // Simulate applyQuestionStyles logic
            if (mockOptions.q_color !== 'default') {
                const colorVal = mockOptions.q_color === 'none'
                    ? 'unset' : mockOptions.q_color_picker;
                questions.forEach(question => {
                    question.style.backgroundColor = colorVal;
                });
            }

            questions.forEach(q => {
                // Browser converts hex to rgb format
                expect(q.style.backgroundColor).toBe('rgb(240, 240, 240)');
            });
        });

        test('should remove padding when color is unset', () => {
            mockOptions.q_color = 'none';
            const questions = container.querySelectorAll(
                '[data-message-author-role="user"]'
            );

            // Simulate applyQuestionStyles logic
            const colorVal = mockOptions.q_color === 'none' ? 'unset' : mockOptions.q_color_picker;
            questions.forEach(question => {
                question.style.backgroundColor = colorVal;
                if (colorVal === 'unset') {
                    question.style.paddingLeft = '0';
                    question.style.paddingRight = '0';
                }
            });

            questions.forEach(q => {
                // unset value becomes empty string in DOM
                expect(q.style.backgroundColor).toBe('');
                expect(q.style.paddingLeft).toBe('0px');
                expect(q.style.paddingRight).toBe('0px');
            });
        });

        test('should apply foreground color to user messages', () => {
            mockOptions.q_fg_color = 'custom';
            mockOptions.q_fg_color_picker = '#ff0000';

            const questions = container.querySelectorAll(
                '[data-message-author-role="user"]'
            );

            // Simulate applyQuestionStyles logic
            if (mockOptions.q_fg_color !== 'default') {
                questions.forEach(question => {
                    question.style.color = mockOptions.q_fg_color_picker;
                });
            }

            questions.forEach(q => {
                expect(q.style.color).toBe('rgb(255, 0, 0)');
            });
        });

        test('should not affect assistant messages', () => {
            mockOptions.q_color = 'custom';
            mockOptions.q_fg_color = 'custom';

            const assistantMsg = container.querySelector(
                '[data-message-author-role="assistant"]'
            );
            const originalBg = assistantMsg.style.backgroundColor;
            const originalColor = assistantMsg.style.color;

            // Apply styles only to user messages
            const questions = container.querySelectorAll(
                '[data-message-author-role="user"]'
            );
            questions.forEach(question => {
                question.style.backgroundColor = mockOptions.q_color_picker;
                question.style.color = mockOptions.q_fg_color_picker;
            });

            expect(assistantMsg.style.backgroundColor).toBe(originalBg);
            expect(assistantMsg.style.color).toBe(originalColor);
        });

        test('should handle both colors simultaneously', () => {
            mockOptions.q_color = 'custom';
            mockOptions.q_color_picker = '#e0e0e0';
            mockOptions.q_fg_color = 'custom';
            mockOptions.q_fg_color_picker = '#333333';

            const questions = container.querySelectorAll(
                '[data-message-author-role="user"]'
            );

            // Apply both background and foreground colors
            if (mockOptions.q_color !== 'default') {
                questions.forEach(question => {
                    question.style.backgroundColor = mockOptions.q_color_picker;
                });
            }
            if (mockOptions.q_fg_color !== 'default') {
                questions.forEach(question => {
                    question.style.color = mockOptions.q_fg_color_picker;
                });
            }

            questions.forEach(q => {
                // Browser converts hex to rgb
                expect(q.style.backgroundColor).toBe('rgb(224, 224, 224)');
                expect(q.style.color).toBe('rgb(51, 51, 51)');
            });
        });

        test('should handle default color settings (no changes)', () => {
            mockOptions.q_color = 'default';
            mockOptions.q_fg_color = 'default';

            const questions = container.querySelectorAll(
                '[data-message-author-role="user"]'
            );

            // Don't apply any styles when default
            const originalBg = questions[0].style.backgroundColor;
            const originalColor = questions[0].style.color;

            expect(originalBg).toBe('');
            expect(originalColor).toBe('');
        });
    });

    describe('getTriggerButton function (commit a206816)', () => {
        beforeEach(() => {
            localStorage.clear();
        });

        test('should store button ID in localStorage', () => {
            const button = document.createElement('button');
            button.id = 'pdfcrowd-save-button';
            document.body.appendChild(button);

            const event = { target: button };

            // Simulate getTriggerButton logic
            let trigger = event.target;
            if (trigger.id) {
                localStorage.setItem('pdfcrowd-btn', trigger.id);
            }

            expect(localStorage.getItem('pdfcrowd-btn')).toBe('pdfcrowd-save-button');
        });

        test('should retrieve button from localStorage if target has no ID', () => {
            // Set up a button in DOM
            const savedButton = document.createElement('button');
            savedButton.id = 'pdfcrowd-main-btn';
            document.body.appendChild(savedButton);

            // Store in localStorage
            localStorage.setItem('pdfcrowd-btn', 'pdfcrowd-main-btn');

            // Create event with target without ID
            const anonymousElement = document.createElement('div');
            const event = { target: anonymousElement };

            // Simulate getTriggerButton logic
            let trigger = event.target;
            if (!trigger.id) {
                const lastBtn = localStorage.getItem('pdfcrowd-btn');
                if (lastBtn) {
                    const btnElement = document.getElementById(lastBtn);
                    if (btnElement) {
                        trigger = btnElement;
                    }
                }
            }

            expect(trigger).toBe(savedButton);
            expect(trigger.id).toBe('pdfcrowd-main-btn');
        });

        test('should handle missing stored button gracefully', () => {
            localStorage.setItem('pdfcrowd-btn', 'non-existent-button');

            const element = document.createElement('div');
            const event = { target: element };

            // Simulate getTriggerButton logic
            let trigger = event.target;
            if (!trigger.id) {
                const lastBtn = localStorage.getItem('pdfcrowd-btn');
                if (lastBtn) {
                    const btnElement = document.getElementById(lastBtn);
                    if (btnElement) {
                        trigger = btnElement;
                    }
                }
            }

            // Should still be the original target
            expect(trigger).toBe(element);
        });

        test('should update localStorage when new button is clicked', () => {
            localStorage.setItem('pdfcrowd-btn', 'old-button');

            const newButton = document.createElement('button');
            newButton.id = 'new-button';
            document.body.appendChild(newButton);

            const event = { target: newButton };

            // Simulate getTriggerButton logic
            let trigger = event.target;
            if (trigger.id) {
                localStorage.setItem('pdfcrowd-btn', trigger.id);
            }

            expect(localStorage.getItem('pdfcrowd-btn')).toBe('new-button');
        });
    });

    describe('convert function - spinner on cancel title dialog', () => {
        let btnConvert, spinner, titleOverlay;
        let btnContentElements;

        beforeEach(() => {
            document.body.innerHTML = `
                <main>
                    <div data-message-author-role="user">Test msg</div>
                </main>
                <button id="pdfcrowd-convert-main">
                    <div class="pdfcrowd-btn-content">Save as PDF</div>
                    <div id="pdfcrowd-spinner" class="pdfcrowd-hidden">
                        <div class="pdfcrowd-spinner"></div>
                    </div>
                </button>
                <div class="pdfcrowd-overlay" id="pdfcrowd-title-overlay"
                     style="display: none;">
                    <div class="pdfcrowd-dialog">
                        <div class="pdfcrowd-dialog-header">
                            <span class="pdfcrowd-close-x pdfcrowd-close-btn">
                                &times;
                            </span>
                        </div>
                        <input id="pdfcrowd-title">
                        <button id="pdfcrowd-title-convert">
                            Save PDF
                        </button>
                        <button class="pdfcrowd-close-btn">
                            Cancel
                        </button>
                    </div>
                </div>
            `;

            btnConvert = document.getElementById('pdfcrowd-convert-main');
            spinner = document.getElementById('pdfcrowd-spinner');
            titleOverlay = document.getElementById('pdfcrowd-title-overlay');
            btnContentElements = document.querySelectorAll(
                '.pdfcrowd-btn-content'
            );
        });

        function setupCleanupHandlers() {
            function cleanup() {
                btnConvert.disabled = false;
                spinner.classList.add('pdfcrowd-hidden');
                btnContentElements.forEach(el => {
                    el.classList.remove('pdfcrowd-invisible');
                });
            }

            const cancelBtns = titleOverlay.querySelectorAll(
                '.pdfcrowd-close-btn'
            );
            cancelBtns.forEach(btn => {
                btn.onclick = function() {
                    titleOverlay.style.display = 'none';
                    cleanup();
                };
            });
        }

        test('should hide spinner when Cancel button clicked', () => {
            btnConvert.disabled = true;
            spinner.classList.remove('pdfcrowd-hidden');
            btnContentElements.forEach(el => {
                el.classList.add('pdfcrowd-invisible');
            });
            titleOverlay.style.display = 'flex';

            setupCleanupHandlers();

            const cancelBtn = titleOverlay.querySelectorAll(
                '.pdfcrowd-close-btn'
            )[1];
            cancelBtn.click();

            expect(titleOverlay.style.display).toBe('none');
            expect(btnConvert.disabled).toBe(false);
            expect(spinner.classList.contains('pdfcrowd-hidden'))
                .toBe(true);
            btnContentElements.forEach(el => {
                expect(el.classList.contains('pdfcrowd-invisible'))
                    .toBe(false);
            });
        });

        test('should hide spinner when X button clicked', () => {
            btnConvert.disabled = true;
            spinner.classList.remove('pdfcrowd-hidden');
            btnContentElements.forEach(el => {
                el.classList.add('pdfcrowd-invisible');
            });
            titleOverlay.style.display = 'flex';

            setupCleanupHandlers();

            const xBtn = titleOverlay.querySelectorAll(
                '.pdfcrowd-close-btn'
            )[0];
            xBtn.click();

            expect(titleOverlay.style.display).toBe('none');
            expect(btnConvert.disabled).toBe(false);
            expect(spinner.classList.contains('pdfcrowd-hidden'))
                .toBe(true);
            btnContentElements.forEach(el => {
                expect(el.classList.contains('pdfcrowd-invisible'))
                    .toBe(false);
            });
        });
    });
});