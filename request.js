pdfcrowdChatGPT.doRequest = function(data, fileName, fnCleanup) {
    // 64 MB limit in sendMessage
    const maxBytes = 64 * 1024 * 1024;

    const message = {
        contentScriptQuery: 'postData',
        url: pdfcrowdChatGPT.pdfcrowdAPI,
        username: pdfcrowdChatGPT.username,
        apiKey: pdfcrowdChatGPT.apiKey,
        data: data,
        fileName: fileName
    };

    // Calculate JSON byte size
    const messageSize = new TextEncoder()
        .encode(JSON.stringify(message))
        .length;

    if(messageSize >= maxBytes) {
        fnCleanup();
        pdfcrowdChatGPT.showError(
            null,
            "The selected ChatGPT conversation is too large to process in " +
            "one step. <br>Please select a smaller portion of the " +
            "conversation and try again.",
            true
        );
        return;
    }

    try {
        chrome.runtime.sendMessage(message, response => {
            fnCleanup();

            if(response.status != 200) {
                pdfcrowdChatGPT.showError(response.status, response.message);
            } else {
                pdfcrowdChatGPT.saveBlob(response.url, fileName);
            }
        });
    } catch(error) {
        fnCleanup();
        pdfcrowdChatGPT.showError(null, `Please refresh the page. The 'ChatGPT to PDF by PDFCrowd' extension has likely been updated.<br><small>${error}</small>`);
    }
};

pdfcrowdChatGPT.init();
