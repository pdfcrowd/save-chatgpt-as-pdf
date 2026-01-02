// ==UserScript==
// @name         ChatGPT to PDF by PDFCrowd
// @namespace    http://tampermonkey.net/
// @version      3.7
// @description  Turn your chats into neatly formatted PDF.
// @author       PDFCrowd (https://pdfcrowd.com/)
// @match        https://chatgpt.com/*
// @match        https://chat.com/*
// @icon64       https://github.com/pdfcrowd/save-chatgpt-as-pdf/raw/master/icons/icon64.png
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @connect      api.pdfcrowd.com
// @require      https://github.com/pdfcrowd/save-chatgpt-as-pdf/raw/master/common.js
// @updateURL    https://github.com/pdfcrowd/save-chatgpt-as-pdf/raw/master/userscript/save-chatgpt-as-pdf.user.js
// @downloadURL  https://github.com/pdfcrowd/save-chatgpt-as-pdf/raw/master/userscript/save-chatgpt-as-pdf.user.js
// @license MIT
// ==/UserScript==
/* globals pdfcrowdChatGPT */

// do not modify or delete the following line, it serves as a placeholder for
// the common.js contents which is copied here by "make build-userscript-single-file"
//
// shared.js placeholder
// common.js placeholder

(function() {
    pdfcrowdChatGPT.doRequest = function(data, fileName, fnCleanup) {
        const formData = new FormData();
        for(let key in data) {
            formData.append(key, data[key]);
        }
        GM_xmlhttpRequest({
            url: pdfcrowdChatGPT.pdfcrowdAPI,
            method: 'POST',
            data: formData,
            responseType: 'blob',
            headers: {
                'Authorization': 'Basic ' + btoa(
                    pdfcrowdChatGPT.username + ':' + pdfcrowdChatGPT.apiKey),
            },
            onload: response => {
                fnCleanup();
                if(response.status == 200) {
                    const url = window.URL.createObjectURL(response.response);
                    pdfcrowdChatGPT.saveBlob(url, fileName);
                } else {
                    pdfcrowdChatGPT.showError(
                        response.status, response.responseText);
                }
            },
            onerror: error => {
                console.error('conversion error:', error);
                fnCleanup();
                pdfcrowdChatGPT.showError(500, error.responseText);
            }
        });
    };

    pdfcrowdChatGPT.init();
})();
