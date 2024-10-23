'use strict';

const pdfcrowdChatGPT = {};

pdfcrowdChatGPT.pdfcrowdAPI = 'https://api.pdfcrowd.com/convert/24.04/';
pdfcrowdChatGPT.username = 'chat-gpt';
pdfcrowdChatGPT.apiKey = '29d211b1f6924c22b7a799b4e8fecb7e';

pdfcrowdChatGPT.init = function() {
    if(document.querySelectorAll('.pdfcrowd-convert').length > 0) {
        // avoid double init
        return;
    }

    // remote images live at least 1 minute
    const minImageDuration = 60000;

    const buttonIconFill = (typeof GM_xmlhttpRequest !== 'undefined')
        ? '#A72C16' : '#EA4C3A';

    const blockStyle = document.createElement('style');
    blockStyle.textContent = `
 .pdfcrowd-block {
     position: fixed;
     height: 36px;
     top: 10px;
     right: 180px;
 }

 @media (max-width: 767px) {
     .pdfcrowd-lg {
         display: none;
     }

     .pdfcrowd-sm {
         display: block;
     }
 }

 .pdfcrowd-lg {
     display: block;
 }

 .pdfcrowd-sm {
     display: none;
 }

 .pdfcrowd-btn-smaller .pdfcrowd-lg {
     display: none;
 }

 .pdfcrowd-btn-smaller .pdfcrowd-sm {
     display: block;
 }

 .pdfcrowd-btn-smallest .pdfcrowd-lg, .pdfcrowd-btn-smallest .pdfcrowd-sm {
     display: none;
 }

 svg.pdfcrowd-btn-content {
     width: 1rem;
     height: 1rem;
 }

 #pdfcrowd-convert-main {
     padding-right: 0;
 }

 #pdfcrowd-convert-main:disabled {
     cursor: wait;
     filter: none;
     opacity: 1;
 }

 .pdfcrowd-dropdown-arrow::after {
     display: inline-block;
     width: 0;
     height: 0;
     vertical-align: .255em;
     content: "";
     border-top: .3em solid;
     border-right: .3em solid transparent;
     border-bottom: 0;
     border-left: .3em solid transparent;
 }

 .pdfcrowd-fs-small {
     font-size: .875rem;
 }

 #pdfcrowd-more {
     cursor: pointer;
     padding: .5rem;
     border-top-right-radius: .5rem;
     border-bottom-right-radius: .5rem;
 }

 #pdfcrowd-more:hover {
     background-color: rgba(0,0,0,.1);
 }

 #pdfcrowd-extra-btns {
     border: 1px solid rgba(0,0,0,.1);
     background-color: #fff;
     color: #000;
 }

 .pdfcrowd-extra-btn:hover {
     background-color: rgba(0,0,0,.1);
 }

 .pdfcrowd-extra-btn {
     width: 100%;
     text-align: start;
     display: block;
 }

 .pdfcrowd-hidden {
     display: none;
 }

 #pdfcrowd-spinner {
     position: absolute;
     width: 100%;
     height: 100%;
 }

 .pdfcrowd-spinner {
     border: 4px solid #ccc;
     border-radius: 50%;
     border-top: 4px solid #ffc107;
     width: 1.5rem;
     height: 1.5rem;
     -webkit-animation: spin 1.5s linear infinite;
     animation: spin 1.5s linear infinite;
 }

 @-webkit-keyframes spin {
     0% { -webkit-transform: rotate(0deg); }
     100% { -webkit-transform: rotate(360deg); }
 }

 @keyframes spin {
     0% { transform: rotate(0deg); }
     100% { transform: rotate(360deg); }
 }

 .pdfcrowd-invisible {
     visibility: hidden;
 }

 .pdfcrowd-overlay {
     z-index: 10000;
     display: none;
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background: rgba(0, 0, 0, 0.5);
     justify-content: center;
     align-items: center;
     color: #000;
 }

 .pdfcrowd-dialog {
     background: #fff;
     padding: 0;
     margin: 0.5em;
     border-radius: 5px;
     box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
     text-align: start;
 }

 .pdfcrowd-dialog a {
     color: revert;
 }

 .pdfcrowd-dialog-body {
     padding: 0 2em;
     line-height: 2;
 }

 .pdfcrowd-dialog-footer {
     text-align: center;
     margin: .5em;
     position: relative;
 }

 .pdfcrowd-dialog-header {
     background-color: #eee;
     font-size: 1.25em;
     padding: .5em;
     border-top-left-radius: 10px;
     border-top-right-radius: 10px;
 }

 .pdfcrowd-version {
     position: absolute;
     bottom: 0;
     right: 0;
     font-size: .65em;
     color: #777;
 }

 .pdfcrowd-dialog ul {
     list-style: disc;
     margin: 0;
     padding: 0 0 0 2em;
 }

 .pdfcrowd-close-x {
     cursor: pointer;
     float: right;
     color: #777;
 }

 #pdfcrowd-help {
     cursor: pointer;
 }

 .pdfcrowd-py-1 {
     padding-bottom: 0.25rem;
     padding-top: 0.25rem;
 }

 .pdfcrowd-px-2 {
     padding-left: 0.5rem;
     padding-right: 0.5rem;
 }

 .pdfcrowd-mr-1 {
     margin-right: 0.25rem;
 }

 .pdfcrowd-mr-4 {
     margin-right: 1rem;
 }

 .pdfcrowd-justify-center {
     justify-content: center;
 }

 .pdfcrowd-items-center {
     align-items: center;
 }

 .pdfcrowd-flex {
     display: flex;
 }

 .pdfcrowd-text-left {
     text-align: left;
 }

 .pdfcrowd-text-right {
     text-align: right;
 }

 .pdfcrowd-h-9 {
     height: 2.25rem;
 }

 #pdfcrowd-title {
     margin-top: 1em !important;
     margin-bottom: .5em !important;
     padding: .5em !important;
     border: revert !important;
     visibility: revert !important;
     display: revert !important;
     color: revert !important;
     background: revert !important;
     width: 360px;
     border-radius: 5px;
 }

 .pdfcrowd-category {
     line-height: normal;
     margin-top: 1em;
 }

 .pdfcrowd-category-title {
     font-size: larger;
     font-weight: bold;
 }
`;
    document.head.appendChild(blockStyle);

    const pdfcrowdBlockHtml = `
    <button
        id="pdfcrowd-convert-main"
        type="button"
        role="button"
        tabindex="0"
        aria-label="Save as PDF"
        data-conv-options='{"page_size": "a4"}'
        class="btn btn-secondary btn-small pdfcrowd-h-9 pdfcrowd-convert pdfcrowd-fs-small">
        <svg class="pdfcrowd-mr-1 pdfcrowd-btn-content" version="1.1" viewBox="0 0 30 30" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polyline clip-rule="evenodd" fill="${buttonIconFill}" fill-rule="evenodd" points="30,30 0,30 0,0 30,0 30,30 "/><path d="M15.372,4.377  c0.452,0.213,0.358,0.489,0.219,1.793c-0.142,1.345-0.618,3.802-1.535,6.219c-0.918,2.413-2.28,4.784-3.467,6.539  c-1.186,1.756-2.201,2.897-2.975,3.556c-0.777,0.659-1.314,0.835-1.665,0.893c-0.348,0.058-0.506,0-0.6-0.177  c-0.094-0.176-0.127-0.466-0.046-0.82c0.079-0.35,0.268-0.76,0.804-1.285c0.541-0.527,1.426-1.172,2.661-1.771  c1.235-0.6,2.817-1.156,4.116-1.537c1.299-0.379,2.311-0.585,3.197-0.746c0.888-0.162,1.647-0.277,2.391-0.337  c0.744-0.056,1.474-0.056,2.186,0c0.712,0.06,1.408,0.175,2.011,0.323c0.6,0.146,1.108,0.321,1.551,0.601  c0.442,0.276,0.823,0.657,1.012,1.083c0.192,0.423,0.192,0.893,0.033,1.228c-0.158,0.337-0.476,0.541-0.839,0.66  c-0.364,0.115-0.775,0.144-1.267,0c-0.49-0.148-1.062-0.47-1.662-0.894c-0.601-0.425-1.235-0.952-2.057-1.771  c-0.824-0.819-1.838-1.93-2.692-3.013c-0.854-1.083-1.553-2.136-2.028-3.029c-0.473-0.893-0.727-1.624-0.933-2.355  c-0.206-0.733-0.364-1.464-0.427-2.122S13.326,6.17,13.39,5.701c0.063-0.466,0.16-0.82,0.317-1.055  c0.158-0.23,0.381-0.35,0.539-0.408s0.254-0.058,0.348-0.073c0.094-0.015,0.188-0.044,0.333,0c0.138,0.042,0.321,0.154,0.504,0.268" fill="none" stroke="#FFFFFF" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.4"/></svg>
        <div class="pdfcrowd-lg pdfcrowd-btn-content">
            Save as PDF
        </div>
        <div class="pdfcrowd-sm pdfcrowd-btn-content">
            PDF
        </div>
        <div id="pdfcrowd-more" class="pdfcrowd-dropdown-arrow">
        </div>
        <div id="pdfcrowd-spinner" class="pdfcrowd-hidden">
            <div class="pdfcrowd-flex pdfcrowd-justify-center pdfcrowd-items-center pdfcrowd-mr-4" style="height: 100%;">
                <div class="pdfcrowd-spinner">
                </div>
            </div>
        </div>
    </button>

    <div id="pdfcrowd-extra-btns" class="pdfcrowd-hidden pdfcrowd-text-left">
        <button
            id="pdfcrowd-extra-a4p"
            type="button"
            role="button"
            tabindex="0"
            aria-label="Save as A4 portrait PDF"
            data-conv-options='{"page_size": "a4"}'
            class="pdfcrowd-extra-btn pdfcrowd-convert pdfcrowd-fs-small pdfcrowd-px-2 pdfcrowd-py-1">
            A4 Portrait
        </button>
        <button
            id="pdfcrowd-extra-a4l"
            type="button"
            role="button"
            tabindex="0"
            aria-label="Save as A4 landscape PDF"
            class="pdfcrowd-extra-btn pdfcrowd-convert pdfcrowd-fs-small pdfcrowd-px-2 pdfcrowd-py-1"
            data-conv-options='{"orientation": "landscape", "viewport_width": 1200, "page_size": "a4"}'>
            A4 Landscape
        </button>
        <button
            id="pdfcrowd-extra-lp"
            type="button"
            role="button"
            tabindex="0"
            aria-label="Save as letter portrait PDF"
            data-conv-options='{"page_size": "letter"}'
            class="pdfcrowd-extra-btn pdfcrowd-convert pdfcrowd-fs-small pdfcrowd-px-2 pdfcrowd-py-1">
            Letter Portrait
        </button>
        <button
            id="pdfcrowd-extra-ll"
            type="button"
            role="button"
            tabindex="0"
            aria-label="Save as letter landscape PDF"
            class="pdfcrowd-extra-btn pdfcrowd-convert pdfcrowd-fs-small pdfcrowd-px-2 pdfcrowd-py-1"
            data-conv-options='{"orientation": "landscape", "viewport_width": 1200, "page_size": "letter"}'>
            Letter Landscape
        </button>
        <button
            id="pdfcrowd-extra-single-a4p"
            type="button"
            role="button"
            tabindex="0"
            aria-label="Save as single page"
            data-conv-options='{"page_height": "-1"}'
            class="pdfcrowd-extra-btn pdfcrowd-convert pdfcrowd-fs-small pdfcrowd-px-2 pdfcrowd-py-1">
            Single Page
        </button>
        <hr>
        <a id="pdfcrowd-options" href="#"
           aria-label="Save ChatGPT as PDF options"
           class="pdfcrowd-extra-btn pdfcrowd-fs-small pdfcrowd-px-2 pdfcrowd-py-1">
            Options
        </a>
        <button
            id="pdfcrowd-help"
            type="button"
            role="button"
            aria-label="Save ChatGPT as PDF help"
            class="pdfcrowd-extra-btn pdfcrowd-fs-small pdfcrowd-px-2 pdfcrowd-py-1">
            Help
        </button>
        <a href="${pdfcrowdShared.rateUsLink}" aria-label="Rate the Extension"
           class="pdfcrowd-extra-btn pdfcrowd-fs-small pdfcrowd-px-2 pdfcrowd-py-1">
            Rate the Extension
        </a>
    </div>

    <div class="pdfcrowd-overlay" id="pdfcrowd-error-overlay">
        <div class="pdfcrowd-dialog">
            <div class="pdfcrowd-dialog-header">
                Error occurred
                <span class="pdfcrowd-close-x pdfcrowd-close-btn">&times;</span>
            </div>
            <div class="pdfcrowd-dialog-body" style="text-align: center;">
                <p id="pdfcrowd-error-message"></p>
            </div>
            <div class="pdfcrowd-dialog-footer">
                <button class="btn btn-secondary pdfcrowd-close-btn">Close</button>
            </div>
        </div>
    </div>

    <div class="pdfcrowd-overlay" id="pdfcrowd-title-overlay">
        <div class="pdfcrowd-dialog">
            <div class="pdfcrowd-dialog-header">
                Enter title
                <span class="pdfcrowd-close-x pdfcrowd-close-btn">&times;</span>
            </div>
            <div class="pdfcrowd-dialog-body" style="text-align: center;">
                <input id="pdfcrowd-title" name="pdfcrowd-title-ch" autocomplete="off" autocapitalize="off">
            </div>
            <div class="pdfcrowd-dialog-footer">
                <button id="pdfcrowd-title-convert" class="btn btn-secondary"
                    style="margin-right: .5em">
                    Save PDF
                </button>
                <button class="btn btn-secondary pdfcrowd-close-btn"
                    style="margin-left: .5em">
                    Cancel
                </button>
            </div>
        </div>
    </div>

    <div class="pdfcrowd-overlay" id="pdfcrowd-help-overlay">
        <div class="pdfcrowd-dialog">
            <div class="pdfcrowd-dialog-header">
                Save ChatGPT as PDF <span style="font-size:smaller">by PDFCrowd</span>
                <span class="pdfcrowd-close-x pdfcrowd-close-btn">&times;</span>
            </div>
            <div class="pdfcrowd-dialog-body">
                ${pdfcrowdShared.helpContent}
            </div>

            <div class="pdfcrowd-dialog-footer">
                <button class="btn btn-secondary pdfcrowd-close-btn">Close</button>
                <div class="pdfcrowd-version">${pdfcrowdShared.version}</div>
            </div>
        </div>
    </div>
`;

    function findRow(element) {
        while(element) {
            if(element.classList &&
               element.classList.contains('text-token-text-primary')) {
                return element;
            }
            element = element.parentElement;
        }
        return null;
    }

    function hasParent(element, parent) {
        while(element) {
            if(element === parent) {
                return true;
            }
            element = element.parentElement;
        }
        return false;
    }

    function prepareSelection(element) {
        const selection = window.getSelection();
        if(!selection.isCollapsed) {
            const rangeCount = selection.rangeCount;
            if(rangeCount > 0) {
                const startElement = findRow(
                    selection.getRangeAt(0).startContainer.parentElement);
                if(startElement && hasParent(startElement, element)) {
                    // selection is in the main block
                    const endElement = findRow(
                        selection.getRangeAt(
                            rangeCount-1).endContainer.parentElement);

                    const newContainer = document.createElement('main');
                    newContainer.classList.add('h-full', 'w-full');
                    let currentElement = startElement;
                    while(currentElement) {
                        const child_clone = currentElement.cloneNode(true);
                        newContainer.appendChild(child_clone);
                        persistCanvases(currentElement, child_clone);
                        if(currentElement === endElement) {
                            break;
                        }
                        currentElement = currentElement.nextElementSibling;
                    }
                    return newContainer;
                }
            }
        }
        let element_clone = element.cloneNode(true);
        persistCanvases(element, element_clone);
        if(element_clone.tagName.toLowerCase() !== 'main') {
            // add main element as it's not presented in a shared chat
            const main = document.createElement('main');
            main.classList.add('h-full', 'w-full');
            main.appendChild(element_clone);
            element_clone = main;
        }
        return element_clone;
    }

    function prepareContent(element) {
        element = prepareSelection(element);

        // fix nested buttons error
        element.querySelectorAll('button button').forEach(button => {
            button.parentNode.removeChild(button);
        });

        // remove all scripts and styles
        element.querySelectorAll('script, style').forEach(el => el.remove());

        // solve expired images
        element.querySelectorAll('.grid img').forEach(img => {
            img.setAttribute(
                'alt', 'The image has expired. Refresh ChatGPT page and retry saving to PDF.');
        });

        element.classList.add('chat-gpt-custom');

        return element;
    }

    function showHelp() {
        document.getElementById('pdfcrowd-extra-btns').classList.add(
            'pdfcrowd-hidden');

        document.getElementById('pdfcrowd-help-overlay').style.display = 'flex';
    }

    function addPdfExtension(filename) {
        return filename.replace(/\.*$/, '') + '.pdf';
    }

    function isLight(body) {
        return window.getComputedStyle(document.body).backgroundColor != 'rgb(33, 33, 33)';
    }

    function isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return (
            style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                element.offsetWidth > 0 &&
                element.offsetHeight > 0
        );
    }

    function styleCanvasArea(element, stop_element) {
        while(element) {
            if(element == stop_element) {
                // canvas parent area not found
                return;
            }

            const style_height = element.style.height;
            if(style_height &&
               style_height !== 'auto' &&
               style_height !== 'initial') {
                element.style.height = '';
                return;
            }

            element = element.parentElement;
        }
    }

    function persistCanvases(orig_element, new_element) {
        const items = [];
        const orig_canvases = orig_element.querySelectorAll('canvas');
        const new_canvases = new_element.querySelectorAll('canvas');
        if(orig_canvases.length !== new_canvases.length) {
            return;
        }
        for(let i = 0; i < orig_canvases.length; i++) {
            const orig_canvas = orig_canvases[i];
            if(isElementVisible(orig_canvas)) {
                const new_canvas = new_canvases[i];
                const img = new_canvas.ownerDocument.createElement('img');
                img.src = orig_canvas.toDataURL();
                img.classList.add('pdfcrowd-canvas-img');
                new_canvas.parentNode.replaceChild(img, new_canvas);

                styleCanvasArea(img, new_element);
            }
        }
    }

    function getTitle(main) {
        const h1 = main.querySelector('h1');
        let title;
        if(h1) {
            title = h1.textContent;
        } else {
            const chatTitle = document.querySelector(
                `nav a[href="${window.location.pathname}"]`);
            title = chatTitle
                ? chatTitle.textContent
                : document.getElementsByTagName('title')[0].textContent;
        }
        return title.trim();
    }

    function convert(event) {
        pdfcrowdShared.getOptions(function(options) {
            let main = document.getElementsByTagName('main');
            main = main.length ? main[0] : document.querySelector('div.grow');
            const main_clone = prepareContent(main);
            const h1 = main_clone.querySelector('h1');

            if(options.q_color !== 'default') {
                const questions = main_clone.querySelectorAll(
                    '[data-message-author-role="user"]');
                const color_val = options.q_color === 'none'
                      ? 'unset' : options.q_color_picker;
                questions.forEach(function(question) {
                    question.style.backgroundColor = color_val;
                    if(color_val === 'unset') {
                        question.style.paddingLeft = 0;
                        question.style.paddingRight = 0;
                    }
                });
            }

            let title = getTitle(main);
            let filename = title;

            function doConvert() {
                let trigger = event.target;
                document.getElementById('pdfcrowd-extra-btns').classList.add(
                    'pdfcrowd-hidden');

                const btnConvert = document.getElementById(
                    'pdfcrowd-convert-main');
                btnConvert.disabled = true;
                const spinner = document.getElementById('pdfcrowd-spinner');
                spinner.classList.remove('pdfcrowd-hidden');
                const btnElems = document.getElementsByClassName(
                    'pdfcrowd-btn-content');
                for(let i = 0; i < btnElems.length; i++) {
                    btnElems[i].classList.add('pdfcrowd-invisible');
                }

                function cleanup() {
                    btnConvert.disabled = false;
                    spinner.classList.add('pdfcrowd-hidden');
                    for(let i = 0; i < btnElems.length; i++) {
                        btnElems[i].classList.remove('pdfcrowd-invisible');
                    }
                }

                const data = {
                    jpeg_quality: 70,
                    image_dpi: 150,
                    convert_images_to_jpeg: 'all',
                    title: title,
                    rendering_mode: 'viewport',
                    smart_scaling_mode: 'viewport-fit'
                };

                if(trigger.id) {
                    localStorage.setItem('pdfcrowd-btn', trigger.id);
                } else {
                    let lastBtn = localStorage.getItem('pdfcrowd-btn');
                    if(lastBtn) {
                        lastBtn = document.getElementById(lastBtn);
                        if(lastBtn) {
                            trigger = lastBtn;
                        }
                    }
                }

                const convOptions = JSON.parse(
                    trigger.dataset.convOptions || '{}');

                for(let key in convOptions) {
                    data[key] = convOptions[key];
                }

                if(!('viewport_width' in convOptions)) {
                    data.viewport_width = 800;
                }

                switch(options.margins) {
                case 'minimal':
                    data.no_margins = true;
                    break;
                case 'custom':
                    data.margin_left = options.margin_left || 0;
                    data.margin_right = options.margin_right || 0;
                    data.margin_top = options.margin_top || 0;
                    data.margin_bottom = options.margin_bottom || 0;
                    break;
                default:
                    data.margin_bottom = '12px';
                }

                let classes = '';
                if(options.theme === 'dark' ||
                   (options.theme === '' && !isLight(document.body))) {
                    classes = 'pdfcrowd-dark ';
                    data.page_background_color = '333333';
                }

                if(options.zoom) {
                    data.scale_factor = options.zoom;
                }

                let break_selector;
                if(options.no_questions) {
                    classes += 'pdfcrowd-no-questions ';
                    break_selector = '.gizmo-bot-avatar';
                } else {
                    break_selector = '[data-message-author-role="user"]';
                }

                if(options.page_break === 'after') {
                    const break_elems = main_clone.querySelectorAll(
                        break_selector);
                    break_elems.forEach((element, index) => {
                        if(index !== 0) {
                            element.style.pageBreakBefore = 'always';
                        }
                    });
                }

                if(options.toc) {
                    const toc_title = '';
                    data.on_load_javascript = `
libPdfcrowd.insertTableOfContents({
    selectors: '[data-message-author-role="user"]',
    target: '#pdfcrowd-toc',
    pageBreak: 'after',
    title: '${toc_title}',
    style: 'margin-top: 2em'
});`;
                }

                const h1_style = options.title_mode === 'none' ? 'hidden' : '';
                const toc = '<div id="pdfcrowd-toc"></div>';

                let body;
                if(h1) {
                    if(h1_style) {
                        h1.classList.add(h1_style);
                    }
                    body = toc + main_clone.outerHTML;
                } else {
                    body = `<h1 class="main-title ${h1_style}">${title}</h1>`
                        + toc + main_clone.outerHTML;
                }

                data.text = `<!DOCTYPE html><html><head><meta charSet="utf-8"/></head><body class="${classes}">${body}</body>`;

                pdfcrowdChatGPT.doRequest(
                    data, addPdfExtension(filename), cleanup);
            }

            if(options.title_mode === 'ask') {
                const dlgTitle = document.getElementById(
                    'pdfcrowd-title-overlay');
                const titleInput = document.getElementById('pdfcrowd-title');
                titleInput.value = title;
                dlgTitle.style.display = 'flex';
                titleInput.focus();
                document.getElementById('pdfcrowd-title-convert')
                    .onclick = function() {
                        dlgTitle.style.display = 'none';
                        title = titleInput.value.trim();
                        if(title) {
                            filename = title;
                        }
                        // replace h1 if presented is the converted content
                        if(h1) {
                            h1.innerText = title;
                        }
                        doConvert();
                    };
            } else {
                doConvert();
            }
        });
    }

    function addPdfcrowdBlock() {
        const container = document.createElement('div');
        container.innerHTML = pdfcrowdBlockHtml;
        container.classList.add(
            'pdfcrowd-block', 'pdfcrowd-text-right', 'pdfcrowd-hidden');
        document.body.appendChild(container);

        let buttons = document.querySelectorAll('.pdfcrowd-convert');
        buttons.forEach(element => {
            element.addEventListener('click', convert);
        });

        document.getElementById('pdfcrowd-help').addEventListener(
            'click', event => {
                showHelp();
            });

        document.getElementById('pdfcrowd-more').addEventListener('click', event => {
            event.stopPropagation();
            const moreButtons = document.getElementById(
                'pdfcrowd-extra-btns');
            if(moreButtons.classList.contains('pdfcrowd-hidden')) {
                moreButtons.classList.remove('pdfcrowd-hidden');
            } else {
                moreButtons.classList.add('pdfcrowd-hidden');
            }
        });

        document.addEventListener('click', event => {
            const moreButtons = document.getElementById('pdfcrowd-extra-btns');

            if (!moreButtons.contains(event.target)) {
                moreButtons.classList.add('pdfcrowd-hidden');
            }
        });

        buttons = document.querySelectorAll('.pdfcrowd-close-btn');
        buttons.forEach(element => {
            element.addEventListener('click', () => {
                element.closest('.pdfcrowd-overlay').style.display = 'none';
            });
        });

        return container;
    }

    function isVisible(el) {
        if(el) {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0';
        }
    }

    function areElementsColliding(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();

        return !(
            rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom
        );
    }

    const is_shared = window.location.href.startsWith(
        "https://chatgpt.com/share/");
    const pdfcrowd_block = addPdfcrowdBlock();

    const BUTTON_MARGIN = 8;
    const WIDTHS = [{
        width: 135,
        cls: null
    }, {
        width: 85,
        cls: 'pdfcrowd-btn-smaller'
    }, {
        width: 58,
        cls: 'pdfcrowd-btn-smallest'
    }];

    function getNewPos(elements) {

        for(let i = elements.length - 1; i > 0; i--) {
            const rect1 = elements[i - 1].getBoundingClientRect();
            const rect2 = elements[i].getBoundingClientRect();

            // Calculate horizontal space between the two elements
            const space = rect2.left - (rect1.left + rect1.width);

            for(let j = 0; j < WIDTHS.length; j++) {
                const width = WIDTHS[j];
                if(space >= width.width) {
                    return [rect2.left, width.cls];
                }
            }
        }

        return null;
    }

    function getTopBar() {
        const elements = document.querySelectorAll('.draggable.sticky.top-0');
        for(let element of elements) {
            if(isVisible(element)) {
                return element;
            }
        }

        return null;
    }

    let prevClass = null;

    function changeButtonPosition() {
        const topBar = getTopBar();
        if(topBar) {
            // find button position not overlapping anything
            const newPos = getNewPos(topBar.querySelectorAll(':scope > div'));
            if(newPos) {
                const newPosStr = Math.round(
                    window.innerWidth - newPos[0] + BUTTON_MARGIN) + 'px';
                const newClass = newPos[1];
                if(newPosStr !== pdfcrowd_block.style.right ||
                   prevClass !== newClass) {
                    pdfcrowd_block.style.right = newPosStr;
                    prevClass = newClass;
                    pdfcrowd_block.classList.remove(
                        'pdfcrowd-btn-smaller', 'pdfcrowd-btn-smallest');
                    if(newClass) {
                        pdfcrowd_block.classList.add(newClass);
                    }
                }
                return;
            }
        }
        pdfcrowd_block.classList.remove(
            'pdfcrowd-btn-smaller', 'pdfcrowd-btn-smallest');
        prevClass = null;
    }

    function checkForContent() {
        if(document.querySelector('main div[role="presentation"]') ||
           (is_shared || document.querySelector('div.grow'))) {
            changeButtonPosition();

            pdfcrowd_block.classList.remove('pdfcrowd-hidden');
            // fix conflict with other extensions which remove the button
            if(!pdfcrowd_block.isConnected) {
                console.warn('Extension conflict, another extension deleted PDFCrowd HTML, disable other extensions to fix it.\ncreating the Save as PDF button...');
                document.body.appendChild(pdfcrowd_block);
            }
            if(!blockStyle.isConnected) {
                console.warn('Extension conflict, another extension deleted PDFCrowd HTML, disable other extensions to fix it.\ncreating the button style...');
                document.head.appendChild(blockStyle);
            }
        } else {
            pdfcrowd_block.classList.add('pdfcrowd-hidden');
        }
    }

    const options_el = document.getElementById('pdfcrowd-options');
    if(pdfcrowdShared.hasOptions) {
        options_el.addEventListener('click', function() {
            chrome.runtime.sendMessage({action: "open_options_page"});
        });
    } else {
        options_el.remove();
    }

    setInterval(checkForContent, 1000);
}

pdfcrowdChatGPT.showError = function(status, text) {
  let html;
  if (status == 432) {
    html = [
      "<strong>Fair Use Notice</strong><br>",
      "Current usage is over the limit. Please wait a while before trying again.<br><br>",
    ];
  } else {
      html = [];
      if (status) {
          if(status == 'network-error') {
              html.push('Network error while connecting to the conversion service');
          } else {
              html.push(`Code: ${status}`);
          }
          html.push(text);
          html.push('Please try again later');
      } else {
          html.push(text);
      }
      html.push(`If the problem persists, contact us at
            <a href="mailto:support@pdfcrowd.com?subject=ChatGPT%20error">
              support@pdfcrowd.com
            </a>`);
  }
  html = html.join('<br>');
  document.getElementById('pdfcrowd-error-overlay').style.display = 'flex';
  document.getElementById('pdfcrowd-error-message').innerHTML = html;
};

pdfcrowdChatGPT.saveBlob = function(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
    }, 100);
};
