'use strict';

function initHelp() {
    document.querySelectorAll('.options-link').forEach((item) => {
        item.setAttribute('href', 'options.html');
    });
}

document.addEventListener('DOMContentLoaded', initHelp);
