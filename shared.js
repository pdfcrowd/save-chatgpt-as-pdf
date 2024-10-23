'use strict';

const pdfcrowdShared = {};

pdfcrowdShared.defaultOptions = {
    margins: '',
    theme: '',
    zoom: 100,
    no_questions: false,
    q_color: 'default',
    q_color_picker: '#ecf9f2',
    title_mode: '',
    margin_left: '0.4in',
    margin_right: '0.4in',
    margin_top: '0.4in',
    margin_bottom: '0.4in'
}

pdfcrowdShared.version = 'v1.20';

pdfcrowdShared.rateUsLink = '#';
pdfcrowdShared.hasOptions = true;
if (typeof GM_info !== 'undefined') {
    pdfcrowdShared.rateUsLink = 'https://greasyfork.org/en/scripts/484463-save-chatgpt-as-pdf/feedback#post-discussion';
    pdfcrowdShared.hasOptions = false;
} else if (navigator.userAgent.includes("Chrome")) {
    pdfcrowdShared.rateUsLink = 'https://chromewebstore.google.com/detail/save-chatgpt-as-pdf/ccjfggejcoobknjolglgmfhoeneafhhm/reviews';
} else if (navigator.userAgent.includes("Firefox")) {
    pdfcrowdShared.rateUsLink = 'https://addons.mozilla.org/en-US/firefox/addon/save-chatgpt-as-pdf/reviews/';
}

pdfcrowdShared.helpContent = `
<div class="pdfcrowd-category-title">
    Support
</div>

<div style="line-height:1.5">
    Feel free to contact us with any questions or for assistance. We're always happy to help!
    <br>
    Email us at <strong>support@pdfcrowd.com</strong> or use our
    <a href="https://pdfcrowd.com/contact/?ref=chatgpt&amp;pr=save-chatgpt-as-pdf-pdfcrowd" title="Contact us" target="_blank">
        contact form</a>.
    <br>
    <span class="popup-hidden">
    Please <a href="${pdfcrowdShared.rateUsLink}">rate us</a> if you like the extension. It helps a lot!
    </span>
</div>

<div class="pdfcrowd-category">
    <div class="pdfcrowd-category-title">
        Tips
    </div>
    <ul>
        <li>
            You can download a specific part of the chat by selecting it.
        </li>
        <li>
            If images are missing in the PDF, reload the page and try downloading the PDF again.
        </li>
        <li>
            Customize the PDF file via addon
            <a class="options-link">options</a>.
        </li>
    </ul>
</div>

<div class="pdfcrowd-category">
    <div class="pdfcrowd-category-title">
        Links
    </div>
    <ul>
        <li>
            Save ChatGPT as PDF
            <a href="https://pdfcrowd.com/save-chatgpt-as-pdf/" target="_blank">homepage</a>
        </li>
        <li>
            Visit <a href="https://pdfcrowd.com/" target="_blank">PDFCrowd</a>
            to learn more about our tool and services.
        </li>
        <li>
            Discover how our
            <a href="https://pdfcrowd.com/api/html-to-pdf-api/" target="_blank">HTML to PDF API</a>
            can enhance your projects.
        </li>
    </ul>
</div>
`;

pdfcrowdShared.getOptions = function(callback) {
    if(typeof chrome === 'undefined') {
        callback(pdfcrowdShared.defaultOptions);
    } else {
        try {
            chrome.storage.sync.get('options', function(obj) {
                let rv = {};
                Object.assign(rv, pdfcrowdShared.defaultOptions);
                if(obj.options) {
                    Object.assign(rv, obj.options);
                }
                callback(rv);
            });
        } catch(error) {
            console.error(error);
            callback(pdfcrowdShared.defaultOptions);
        }
    }
}

function init() {
    let elem = document.getElementById('version');
    if(elem) {
        elem.innerHTML = pdfcrowdShared.version;
    }

    elem = document.getElementById('help');
    if(elem) {
        elem.innerHTML = pdfcrowdShared.helpContent;
    }
}

document.addEventListener('DOMContentLoaded', init);
