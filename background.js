function blobToDataURL(blob, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(blob);
}

function decompressString(compressedBase64) {
    return new Promise((resolve, reject) => {
        try {
            const binaryString = atob(compressedBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const stream = new Blob([bytes])
                .stream()
                .pipeThrough(new DecompressionStream('gzip'));

            new Response(stream).text()
                .then(decompressed => {
                    resolve(JSON.parse(decompressed));
                })
                .catch(reject);
        } catch(error) {
            reject(error);
        }
    });
}

function processRequest(request, sendResponse) {
    let dataPromise;

    if(request.isCompressed && request.data.compressed) {
        dataPromise = decompressString(request.data.compressed);
    } else {
        dataPromise = Promise.resolve(request.data);
    }

    dataPromise.then(data => {
        const formData = new FormData();
        for(let key in data) {
            formData.append(key, data[key]);
        }

        fetch(request.url, {
            method: 'POST',
            body: formData,
            responseType: 'blob',
            headers: {
                'Authorization': 'Basic ' + btoa(
                    request.username + ':' + request.apiKey),
            }
        }).then(response => {
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
        }).catch(error => {
            sendResponse({
                status: error.status || 'network-error',
                message: error.toString()
            });
        });
    }).catch(error => {
        sendResponse({
            status: 'decompression-error',
            message: 'Failed to decompress data: ' + error.toString()
        });
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.contentScriptQuery == 'postData') {
            processRequest(request, sendResponse);
            return true;
        }
    }
);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "open_options_page") {
        chrome.runtime.openOptionsPage();
    }
});
