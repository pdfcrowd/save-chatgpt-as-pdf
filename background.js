const sessions = {};

function blobToDataURL(blob, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(blob);
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

function tryCompress(htmlContent) {
    return new Promise((resolve, reject) => {
        if(typeof CompressionStream === 'undefined') {
            reject(new Error('CompressionStream not available'));
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
}

function prepareFile(htmlContent) {
    return tryCompress(htmlContent)
        .then(result => result)
        .catch(error => {
            const htmlBlob = new Blob([htmlContent], {type: 'text/html'});
            return {
                blob: htmlBlob,
                filename: 'index.html'
            };
        });
}

function sendToAPI(fileData, request, sendResponse) {
    const formData = new FormData();

    for(let key in request.params) {
        formData.append(key, request.params[key]);
    }
    formData.append('file', fileData.blob, fileData.filename);

    fetch(request.url, {
        method: 'POST',
        body: formData,
        responseType: 'blob',
        headers: {
            'Authorization': 'Basic ' + btoa(
                request.username + ':' + request.apiKey
            )
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
        if(request.contentScriptQuery == 'uploadChunk') {
            const sessionId = request.sessionId;

            if(!sessions[sessionId]) {
                const now = Date.now();
                const SESSION_TIMEOUT = 10 * 60 * 1000;

                for(let id in sessions) {
                    if(now - sessions[id].createdAt > SESSION_TIMEOUT) {
                        delete sessions[id];
                    }
                }

                sessions[sessionId] = {
                    chunks: new Array(request.totalChunks),
                    receivedChunks: 0,
                    createdAt: now
                };
            }

            sessions[sessionId].chunks[request.chunkIndex] = request.chunkData;
            sessions[sessionId].receivedChunks++;

            sendResponse({success: true});
            return true;
        }

        if(request.contentScriptQuery == 'processData') {
            const sessionId = request.sessionId;
            const session = sessions[sessionId];

            if(!session) {
                sendResponse({
                    status: 'error',
                    message: 'Session not found'
                });
                return true;
            }

            const htmlContent = session.chunks.join('');
            delete sessions[sessionId];

            prepareFile(htmlContent)
                .then(fileData => {
                    sendToAPI(fileData, request, sendResponse);
                })
                .catch(error => {
                    sendResponse({
                        status: 'error',
                        message: error.toString()
                    });
                });

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
