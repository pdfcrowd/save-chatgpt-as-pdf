pdfcrowdChatGPT.CHUNK_SIZE = 10 * 1024 * 1024;

pdfcrowdChatGPT.sendChunkedData = function(
    htmlContent,
    params,
    fileName,
    fnCleanup
) {
    const sessionId = 'session_' + Date.now() + '_' + Math.random();
    const chunks = [];
    const chunkSize = pdfcrowdChatGPT.CHUNK_SIZE;

    for (let i = 0; i < htmlContent.length; i += chunkSize) {
        chunks.push(htmlContent.substring(i, i + chunkSize));
    }

    const totalChunks = chunks.length;
    let currentChunk = 0;

    console.log(
        '[ChatGPT to PDF] Starting upload:',
        'HTML size:',
        htmlContent.length,
        'bytes,',
        'Chunks:',
        totalChunks,
        'Session:',
        sessionId
    );

    const sendNextChunk = function() {
        if (currentChunk >= totalChunks) {
            console.log(
                '[ChatGPT to PDF] All chunks uploaded, requesting conversion'
            );
            chrome.runtime.sendMessage({
                contentScriptQuery: 'processData',
                sessionId: sessionId,
                url: pdfcrowdChatGPT.pdfcrowdAPI,
                username: pdfcrowdChatGPT.username,
                apiKey: pdfcrowdChatGPT.apiKey,
                params: params,
                fileName: fileName
            }, response => {
                fnCleanup();
                if (response.status != 200) {
                    console.error(
                        '[ChatGPT to PDF] Conversion failed:',
                        response.status,
                        response.message
                    );
                    pdfcrowdChatGPT.showError(
                        response.status,
                        response.message
                    );
                } else {
                    console.log(
                        '[ChatGPT to PDF] PDF generated successfully'
                    );
                    pdfcrowdChatGPT.saveBlob(response.url, fileName);
                }
            });
            return;
        }

        console.log(
            '[ChatGPT to PDF] Uploading chunk',
            currentChunk + 1,
            '/',
            totalChunks
        );
        chrome.runtime.sendMessage({
            contentScriptQuery: 'uploadChunk',
            sessionId: sessionId,
            chunkIndex: currentChunk,
            totalChunks: totalChunks,
            chunkData: chunks[currentChunk]
        }, response => {
            if (response && response.success) {
                currentChunk++;
                sendNextChunk();
            } else {
                fnCleanup();
                pdfcrowdChatGPT.showError(
                    null,
                    "Failed to upload chunk " + currentChunk +
                    `<br><small>${response.error}</small>`
                );
            }
        });
    };

    try {
        sendNextChunk();
    } catch(error) {
        fnCleanup();
        pdfcrowdChatGPT.showError(
            null,
            "Failed to send data: " +
            `<br><small>${error}</small>`
        );
    }
};

pdfcrowdChatGPT.doRequest = function(
    htmlContent,
    params,
    fileName,
    fnCleanup
) {
    pdfcrowdChatGPT.sendChunkedData(
        htmlContent,
        params,
        fileName,
        fnCleanup
    );
};

pdfcrowdChatGPT.init();
