'use strict';

const pdfcrowdChatGPT = {};

pdfcrowdChatGPT.pdfcrowdAPI = 'https://api.pdfcrowd.com/convert/latest/';
pdfcrowdChatGPT.username = 'chat-gpt';
pdfcrowdChatGPT.apiKey = '29d211b1f6924c22b7a799b4e8fecb7e';

pdfcrowdChatGPT.init = function() {
    const urlPattern = /^.*?:\/\/chat\.openai\.com\/((c|g|share)\/.*)?$/;
    let currentUrl = '';

    function checkUrlChange() {
        const newUrl = window.location.href;
        if(currentUrl !== newUrl) {
            currentUrl = newUrl;

            const blocks = document.getElementsByClassName('pdfcrowd-block');
            if(urlPattern.test(currentUrl)) {
                for(let i = 0; i < blocks.length; i++) {
                    blocks[i].classList.remove('pdfcrowd-hidden');
                }
            } else {
                for(let i = 0; i < blocks.length; i++) {
                    blocks[i].classList.add('pdfcrowd-hidden');
                }
            }
        }
    }

    setInterval(checkUrlChange, 2000);

    // remote images live at least 1 minute
    const minImageDuration = 60000;

    const buttonIconFill = (typeof GM_xmlhttpRequest !== 'undefined')
          ? '#A72C16' : '#EA4C3A';

    const pdfcrowdBlockHtml = `
<style>
 .pdfcrowd-block {
     position: fixed;
     height: 36px;
     top: 10px;
     right: 55px;
 }

 @media (min-width: 768px) {
     .pdfcrowd-lg {
         display: block;
     }

     .pdfcrowd-sm {
         display: none;
     }
 }

 @media (max-width: 767px) {
     .pdfcrowd-block {
         top: 4px;
         right: 36px;
     }

     .pdfcrowd-lg {
         display: none;
     }

     .pdfcrowd-sm {
         display: block;
     }
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

 .pdfcrowd-convert {
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
 }

 .pdfcrowd-dialog {
     background: #fff;
     padding: 20px;
     border-radius: 5px;
     box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
     text-align: center;
 }
 .pdfcrowd-dialog a {
     color: revert;
 }
</style>

<div class="pdfcrowd-block text-right">
    <button
        id="pdfcrowd-convert-main"
        type="button"
        role="button"
        tabindex="0"
        aria-label="Save as PDF"
        data-conv-options='{"page_size": "a4"}'
        class="btn btn-neutral btn-small h-9 pdfcrowd-convert">
        <svg class="mr-1 pdfcrowd-btn-content" version="1.1" viewBox="0 0 30 30" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polyline clip-rule="evenodd" fill="${buttonIconFill}" fill-rule="evenodd" points="30,30 0,30 0,0 30,0 30,30 "/><path d="M15.372,4.377  c0.452,0.213,0.358,0.489,0.219,1.793c-0.142,1.345-0.618,3.802-1.535,6.219c-0.918,2.413-2.28,4.784-3.467,6.539  c-1.186,1.756-2.201,2.897-2.975,3.556c-0.777,0.659-1.314,0.835-1.665,0.893c-0.348,0.058-0.506,0-0.6-0.177  c-0.094-0.176-0.127-0.466-0.046-0.82c0.079-0.35,0.268-0.76,0.804-1.285c0.541-0.527,1.426-1.172,2.661-1.771  c1.235-0.6,2.817-1.156,4.116-1.537c1.299-0.379,2.311-0.585,3.197-0.746c0.888-0.162,1.647-0.277,2.391-0.337  c0.744-0.056,1.474-0.056,2.186,0c0.712,0.06,1.408,0.175,2.011,0.323c0.6,0.146,1.108,0.321,1.551,0.601  c0.442,0.276,0.823,0.657,1.012,1.083c0.192,0.423,0.192,0.893,0.033,1.228c-0.158,0.337-0.476,0.541-0.839,0.66  c-0.364,0.115-0.775,0.144-1.267,0c-0.49-0.148-1.062-0.47-1.662-0.894c-0.601-0.425-1.235-0.952-2.057-1.771  c-0.824-0.819-1.838-1.93-2.692-3.013c-0.854-1.083-1.553-2.136-2.028-3.029c-0.473-0.893-0.727-1.624-0.933-2.355  c-0.206-0.733-0.364-1.464-0.427-2.122S13.326,6.17,13.39,5.701c0.063-0.466,0.16-0.82,0.317-1.055  c0.158-0.23,0.381-0.35,0.539-0.408s0.254-0.058,0.348-0.073c0.094-0.015,0.188-0.044,0.333,0c0.138,0.042,0.321,0.154,0.504,0.268" fill="none" stroke="#FFFFFF" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.4"/></svg>
        <div class="pdfcrowd-lg pdfcrowd-btn-content">
            Save as PDF
        </div>
        <div class="pdfcrowd-sm pdfcrowd-btn-content">
            PDF
        </div>
        <div id="pdfcrowd-more" class="pdfcrowd-dropdown-arrow">
        </div>
        <div id="pdfcrowd-spinner" class="pdfcrowd-hidden">
            <div class="flex justify-center items-center mr-4" style="height: 100%;">
                <div class="pdfcrowd-spinner">
                </div>
            </div>
        </div>
    </button>

    <div id="pdfcrowd-extra-btns" class="pdfcrowd-hidden text-left">
        <div
            id="pdfcrowd-extra-a4p"
            type="button"
            role="button"
            tabindex="0"
            aria-label="Save as A4 portrait PDF"
            data-conv-options='{"page_size": "a4"}'
            class="pdfcrowd-extra-btn pdfcrowd-convert px-2 py-1">
            A4 Portrait
        </div>
        <div
            id="pdfcrowd-extra-a4l"
            type="button"
            role="button"
            tabindex="0"
            aria-label="Save as A4 landscape PDF"
            class="pdfcrowd-extra-btn pdfcrowd-convert px-2 py-1"
            data-conv-options='{"orientation": "landscape", "viewport_width": 1200, "page_size": "a4"}'>
            A4 Landscape
        </div>
        <div
            id="pdfcrowd-extra-lp"
            type="button"
            role="button"
            tabindex="0"
            aria-label="Save as letter portrait PDF"
            data-conv-options='{"page_size": "letter"}'
            class="pdfcrowd-extra-btn pdfcrowd-convert px-2 py-1">
            Letter Portrait
        </div>
        <div
            id="pdfcrowd-extra-ll"
            type="button"
            role="button"
            tabindex="0"
            aria-label="Save as letter landscape PDF"
            class="pdfcrowd-extra-btn pdfcrowd-convert px-2 py-1"
            data-conv-options='{"orientation": "landscape", "viewport_width": 1200, "page_size": "letter"}'>
            Letter Landscape
        </div>
    </div>

    <div class="pdfcrowd-overlay" id="pdfcrowd-error-overlay" style="color: #000">
        <div class="pdfcrowd-dialog">
            <p id="pdfcrowd-error-message" class="my-2"></p>
            <button id="pdfcrowd-close-btn" class="btn btn-neutral">Close</button>
        </div>
    </div>
</div>
`;

    function prepareContent(element) {
        element = element.cloneNode(true);

        // fix nested buttons error
        element.querySelectorAll('button button').forEach(button => {
            button.parentNode.removeChild(button);
        });

        // solve user icons
        element.querySelectorAll('.gizmo-shadow-stroke').forEach(icon => {
            let parent = icon.parentNode;
            while(parent) {
                const label = parent.querySelector('.font-semibold');
                if(label) {
                    label.insertBefore(icon, label.firstChild);
                    label.style.marginTop = '1.5rem';
                    label.style.marginBottom = '.25rem';
                    break;
                }
                parent = parent.parentNode;
            }
        });

        // solve expired images
        element.querySelectorAll('.grid img').forEach(img => {
            img.setAttribute(
                'alt', 'The image has expired. Refresh ChatGPT page and retry saving to PDF.');
        });

        element.classList.add('chat-gpt-custom');

        return element.outerHTML;
    }

    function convert(event) {
        let trigger = event.target;
        document.getElementById('pdfcrowd-extra-btns').classList.add(
            'pdfcrowd-hidden');

        const btnConvert = document.getElementById('pdfcrowd-convert-main');
        btnConvert.disabled = true;
        const spinner = document.getElementById('pdfcrowd-spinner');
        spinner.classList.remove('pdfcrowd-hidden');
        const btnElems = document.getElementsByClassName('pdfcrowd-btn-content');
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

        const main = document.getElementsByTagName('main')[0];
        const content = prepareContent(main);

        let body;
        let title = '';
        const h1 = main.querySelector('h1');
        if(h1) {
            title = h1.textContent;
            body = content;
        } else {
            const chatTitle = document.querySelector(`nav a[href="${window.location.pathname}"]`);
            title = chatTitle
                ? chatTitle.textContent
                : document.getElementsByTagName('title')[0].textContent;
            body = `<h1 class="main-title">${title}</h1>` + content;
        }

        const data = {
            text: `<!DOCTYPE html><html><head><meta charSet="utf-8"/></head><body>${body}</body>`,
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

        const convOptions = JSON.parse(trigger.dataset.convOptions || '{}');

        for(let key in convOptions) {
            data[key] = convOptions[key];
        }

        if(!('viewport_width' in convOptions)) {
            data.viewport_width = 800;
        }

        pdfcrowdChatGPT.doRequest(data, title + '.pdf', cleanup);
    }

    function showButton() {
        let buttons = document.querySelectorAll('.pdfcrowd-convert');
        if(buttons.length > 0) {
            return;
        }
        const container = document.createElement('div');
        container.innerHTML = pdfcrowdBlockHtml;
        document.body.appendChild(container);

        checkUrlChange();

        buttons = document.querySelectorAll('.pdfcrowd-convert');
        buttons.forEach(element => {
            element.addEventListener('click', convert);
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

        document.getElementById('pdfcrowd-close-btn').addEventListener(
            'click', () => {
                document.getElementById(
                    'pdfcrowd-error-overlay').style.display = 'none';
            });
    }

    let buttonVisible = false;

    function checkForContent() {
        if(!buttonVisible) {
            const mainElement = document.querySelector(
                'main > div:first-child');

            if (mainElement && mainElement.textContent.trim().length > 0) {
                buttonVisible = true;
                showButton();
            } else {
                // content not found, continue checking
                setTimeout(checkForContent, 1000);
            }
        }
    }

    setTimeout(checkForContent, 1000);
}

pdfcrowdChatGPT.showError = function(status, text) {
  let html;
  if (status == 432) {
    html = [
      "<strong>Fair Use Notice</strong><br>",
      "Current usage is over the limit. Please wait a while before trying again.<br><br>",
    ];
  } else {
    html = ['<strong>Error occurred</strong>'];
    if (status) {
      html.push(`Code: ${status}`);
      html.push("Please try again later");
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
