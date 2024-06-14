document.addEventListener('DOMContentLoaded', () => {
    let permissions;
    if(typeof browser !== 'undefined') {
        permissions = browser.permissions;
    } else if(typeof chrome !== 'undefined') {
        permissions = chrome.permissions;
    }
    if(permissions) {
        permissions.contains({
            origins: ['*://chatgpt.com/*']
        }).then((result) => {
            if (!result) {
                document.getElementById('warning').style.display = 'block';
            }
        });
    }
});
