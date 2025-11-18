pdfcrowdChatGPT.MAX_MESSAGE_BYTES = 64 * 1024 * 1024;

pdfcrowdChatGPT.sendMessageToBackground = function(
    message,
    fileName,
    fnCleanup
) {
    try {
        chrome.runtime.sendMessage(message, response => {
            fnCleanup();
            if(response.status != 200) {
                pdfcrowdChatGPT.showError(
                    response.status,
                    response.message
                );
            } else {
                pdfcrowdChatGPT.saveBlob(response.url, fileName);
            }
        });
    } catch(error) {
        fnCleanup();
        pdfcrowdChatGPT.showError(
            null,
            "Please refresh the page. The 'ChatGPT to PDF by " +
            "PDFCrowd' extension has likely been " +
            `updated.<br><small>${error}</small>`
        );
    }
};

pdfcrowdChatGPT.createGzip = function(data) {
    return new Promise((resolve, reject) => {
        const htmlContent = data.text;
        const encoder = new TextEncoder();
        const htmlBytes = encoder.encode(htmlContent);
        const fileSize = htmlBytes.length;

        const stream = new Blob([htmlBytes])
            .stream()
            .pipeThrough(new CompressionStream('gzip'));

        new Response(stream).arrayBuffer()
            .then(gzippedData => {
                const gzipped = new Uint8Array(gzippedData);

                let base64String;
                try {
                    let binaryString = '';
                    const chunkSize = 8192;
                    for (let i = 0; i < gzipped.length; i += chunkSize) {
                        const chunk = gzipped.subarray(
                            i,
                            Math.min(i + chunkSize, gzipped.length)
                        );
                        binaryString += String.fromCharCode(...chunk);
                    }

                    base64String = btoa(binaryString);
                } catch(error) {
                    reject(error);
                    return;
                }

                resolve({
                    gzipBase64: base64String,
                    originalSize: fileSize,
                    compressedSize: gzipped.length,
                    otherParams: Object.keys(data)
                        .filter(k => k !== 'text')
                        .reduce((obj, k) => {
                            obj[k] = data[k];
                            return obj;
                        }, {})
                });
            })
            .catch(reject);
    });
};

pdfcrowdChatGPT.doRequest = function(data, fileName, fnCleanup) {
    pdfcrowdChatGPT.createGzip(data)
        .then(result => {
            const compressedMessage = {
                contentScriptQuery: 'postData',
                url: pdfcrowdChatGPT.pdfcrowdAPI,
                username: pdfcrowdChatGPT.username,
                apiKey: pdfcrowdChatGPT.apiKey,
                gzipFile: result.gzipBase64,
                params: result.otherParams,
                fileName: fileName
            };

            const compressedSize = new TextEncoder()
                .encode(JSON.stringify(compressedMessage))
                .length;

            if(compressedSize >= pdfcrowdChatGPT.MAX_MESSAGE_BYTES) {
                fnCleanup();
                pdfcrowdChatGPT.showError(
                    null,
                    "The selected ChatGPT conversation is too large " +
                    "to process even after compression. <br>Please " +
                    "select a smaller portion of the conversation " +
                    "and try again.",
                    true
                );
            } else {
                pdfcrowdChatGPT.sendMessageToBackground(
                    compressedMessage,
                    fileName,
                    fnCleanup
                );
            }
        })
        .catch(error => {
            fnCleanup();
            pdfcrowdChatGPT.showError(
                null,
                "Failed to create GZIP: " +
                `<br><small>${error}</small>`
            );
        });
};

pdfcrowdChatGPT.init();
