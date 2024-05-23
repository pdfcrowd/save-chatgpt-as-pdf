function blobToDataURL(blob, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(blob);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.contentScriptQuery == 'postData') {
            const formData = new FormData();
            for(let key in request.data) {
                formData.append(key, request.data[key]);
            }
            fetch(request.url, {
                method: 'POST',
                body: formData,
                responseType: 'blob',
                headers: {
                    'Authorization': 'Basic ' + btoa(
                        request.username + ':' + request.apiKey),
                }}).then(response => {
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
                        status: error.status || 500,
                        message: error.responseText
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
