pdfcrowdChatGPT.doRequest = function(data, fileName, fnCleanup) {
    try {
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
    } catch(error) {
        fnCleanup();
        pdfcrowdChatGPT.showError(null, `Please refresh the page. The 'Save ChatGPT as PDF' extension has likely been updated.<br><small>${error}</small>`);
    }
};

pdfcrowdChatGPT.init();
