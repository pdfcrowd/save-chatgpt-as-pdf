pdfcrowdChatGPT.compressString = function(str) {
    return new Promise((resolve, reject) => {
        const stream = new Blob([str])
            .stream()
            .pipeThrough(new CompressionStream('gzip'));

        new Response(stream).arrayBuffer()
            .then(buffer => {
                const uint8Array = new Uint8Array(buffer);
                let binaryString = '';
                for(let i = 0; i < uint8Array.length; i++) {
                    binaryString += String.fromCharCode(uint8Array[i]);
                }
                resolve(btoa(binaryString));
            })
            .catch(reject);
    });
};

pdfcrowdChatGPT.createMessage = function(data, fileName, isCompressed) {
    return {
        contentScriptQuery: 'postData',
        url: pdfcrowdChatGPT.pdfcrowdAPI,
        username: pdfcrowdChatGPT.username,
        apiKey: pdfcrowdChatGPT.apiKey,
        data: data,
        fileName: fileName,
        isCompressed: isCompressed || false
    };
};

pdfcrowdChatGPT.calculateMessageSize = function(message) {
    return new TextEncoder().encode(JSON.stringify(message)).length;
};

pdfcrowdChatGPT.handleResponse = function(response, fileName, fnCleanup) {
    fnCleanup();

    if(response.status != 200) {
        pdfcrowdChatGPT.showError(response.status, response.message);
    } else {
        pdfcrowdChatGPT.saveBlob(response.url, fileName);
    }
};

pdfcrowdChatGPT.sendMessage = function(message, fileName, fnCleanup) {
    try {
        chrome.runtime.sendMessage(message, response => {
            pdfcrowdChatGPT.handleResponse(response, fileName, fnCleanup);
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

pdfcrowdChatGPT.showSizeError = function(fnCleanup) {
    fnCleanup();
    pdfcrowdChatGPT.showError(
        null,
        "The selected ChatGPT conversation is too large to process " +
        "in one step. <br>Please select a smaller portion of the " +
        "conversation and try again.",
        true
    );
};

pdfcrowdChatGPT.doRequest = function(data, fileName, fnCleanup) {
    const maxBytes = 64 * 1024 * 1024;
    const message = pdfcrowdChatGPT.createMessage(data, fileName, false);
    const messageSize = pdfcrowdChatGPT.calculateMessageSize(message);

    if(messageSize >= maxBytes) {
        pdfcrowdChatGPT.compressString(JSON.stringify(data))
            .then(compressed => {
                const compressedMessage = pdfcrowdChatGPT.createMessage(
                    {compressed: compressed},
                    fileName,
                    true
                );

                const compressedSize =
                    pdfcrowdChatGPT.calculateMessageSize(compressedMessage);

                if(compressedSize >= maxBytes) {
                    pdfcrowdChatGPT.showSizeError(fnCleanup);
                } else {
                    pdfcrowdChatGPT.sendMessage(
                        compressedMessage,
                        fileName,
                        fnCleanup
                    );
                }
            })
            .catch(compressionError => {
                fnCleanup();
                pdfcrowdChatGPT.showError(
                    null,
                    "Failed to compress message: " +
                    `<br><small>${compressionError}</small>`
                );
            });
    } else {
        pdfcrowdChatGPT.sendMessage(message, fileName, fnCleanup);
    }
};

pdfcrowdChatGPT.init();
