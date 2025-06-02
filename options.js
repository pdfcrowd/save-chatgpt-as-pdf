'use strict';

function saveOptions(event) {
    event.preventDefault();

    const zoom_el = document.getElementById('zoom');
    if(zoom_el.value < 30) {
        zoom_el.value = 30;
    } else if(zoom_el.value > 300) {
        zoom_el.value = 300;
    }

    let options = {};
    const keys = Object.getOwnPropertyNames(pdfcrowdShared.defaultOptions);
    keys.forEach(key => {
        const item = document.getElementById(key);
        if(item.type == "checkbox") {
            options[item.name] = item.checked;
        } else {
            options[item.name] = item.value;
        }
    });

    chrome.storage.sync.set({ options: options }, function() {
        const status = document.getElementById('status');
        status.style.display = 'inline';
        setTimeout(function() {
            status.style.display = 'none';
        }, 2500);
    });
}

function restoreOptions() {
    pdfcrowdShared.getOptions(function(options) {
        const keys = Object.getOwnPropertyNames(pdfcrowdShared.defaultOptions);
        keys.forEach(key => {
            const item = document.getElementById(key);
            if(item.type == "checkbox") {
                item.checked = options[key];
            } else {
                item.value = options[key];
            }
            let event = new Event('change');
            item.dispatchEvent(event);
        });
    });
}

function resetOptions(event) {
    const options = pdfcrowdShared.defaultOptions;
    const keys = Object.getOwnPropertyNames(options);
    keys.forEach(key => {
        const item = document.getElementById(key);
        if(item.type == "checkbox") {
            item.checked = options[item.name];
        } else {
            item.value = options[item.name];
        }
        let event = new Event('change');
        item.dispatchEvent(event);
    });

    saveOptions(event);
}

function onChange() {
    document.getElementById('status').style.display = 'none';
}

function toggleColorInput(value, pickerId) {
    const colorInput = document.getElementById(pickerId);
    if (value === 'custom') {
        colorInput.style.display = 'table-row';
    } else {
        colorInput.style.display = 'none';
    }
}

function toggleMargins() {
    const sub_margins = document.querySelectorAll('.sub-margin');
    if (this.value === 'custom') {
        sub_margins.forEach(function(element) {
            element.style.display = 'table-row';
        });
    } else {
        sub_margins.forEach(function(element) {
            element.style.display = 'none';
        });
    }
}

document.getElementById('q_color').addEventListener(
    'change', function() {
        toggleColorInput(this.value, 'q_color_picker_row');
    });
document.getElementById('q_fg_color').addEventListener(
    'change', function() {
        toggleColorInput(this.value, 'q_fg_color_picker_row');
    });
document.getElementById('margins').addEventListener(
    'change', toggleMargins);

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('reset').addEventListener('click', resetOptions);
document.querySelectorAll('input,select').forEach((input) => {
    input.addEventListener('change', onChange);
});
