function blobToDataURL(blob, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(blob);
}

function base64ToBlob(base64, mimeType) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], {type: mimeType});
}

function handleAPIResponse(response, sendResponse) {
    if(response.status != 200) {
        response.text().then(errorMessage => {
            sendResponse({
                status: response.status,
                message: errorMessage
            });
        });
    } else {
        response.blob().then(blob => {
            blobToDataURL(blob, url => {
                sendResponse({
                    status: 200,
                    blob: blob,
                    url: url
                });
            });
        });
    }
}

function sendToAPI(data, request, sendResponse) {
    const formData = new FormData();

    for(let key in data) {
        if(key === 'file' && data[key] instanceof Blob) {
            formData.append(key, data[key], 'index.html.gz');
        } else {
            formData.append(key, data[key]);
        }
    }

    fetch(request.url, {
        method: 'POST',
        body: formData,
        responseType: 'blob',
        headers: {
            'Authorization': 'Basic ' + btoa(
                request.username + ':' + request.apiKey)
        }
    }).then(response => {
        handleAPIResponse(response, sendResponse);
    }).catch(error => {
        sendResponse({
            status: error.status || 'network-error',
            message: error.toString()
        });
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.contentScriptQuery == 'postData') {
            const gzipBlob = base64ToBlob(
                request.gzipFile,
                'application/gzip'
            );
            const data = {...request.params, file: gzipBlob};
            sendToAPI(data, request, sendResponse);
            return true;
        }
    }
);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "open_options_page") {
        chrome.runtime.openOptionsPage();
    }
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        const newUserDefaults = {
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

        chrome.storage.sync.set({options: newUserDefaults});
    }
});
