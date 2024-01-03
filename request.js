pdfcrowdChatGPT.doRequest = function(data, fileName, fnCleanup) {
    chrome.runtime.sendMessage({
        contentScriptQuery: 'postData',
        url: pdfcrowdChatGPT.pdfcrowdAPI,
        username: pdfcrowdChatGPT.username,
        apiKey: pdfcrowdChatGPT.apiKey,
        data: data,
        fileName: fileName
    }, response => {
        fnCleanup();

        if(response.status != 200) {
            pdfcrowdChatGPT.showError(response.status, response.message);
        } else {
            pdfcrowdChatGPT.saveBlob(response.url, fileName);
        }
    });
};

pdfcrowdChatGPT.init();
