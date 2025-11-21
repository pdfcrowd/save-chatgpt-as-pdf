// Jest setup file - mocks Chrome APIs and global setup
require('@testing-library/jest-dom');

// Add TextEncoder/TextDecoder for Node environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Chrome API
global.chrome = {
    runtime: {
        sendMessage: jest.fn((message, callback) => {
            if (callback) callback({});
        }),
        onMessage: {
            addListener: jest.fn(),
            removeListener: jest.fn()
        },
        lastError: null,
        getURL: jest.fn(path => `chrome-extension://fakeid/${path}`)
    },
    storage: {
        local: {
            get: jest.fn((keys, callback) => {
                callback({});
            }),
            set: jest.fn((items, callback) => {
                if (callback) callback();
            })
        },
        sync: {
            get: jest.fn((keys, callback) => {
                callback({});
            }),
            set: jest.fn((items, callback) => {
                if (callback) callback();
            })
        }
    },
    tabs: {
        query: jest.fn((query, callback) => {
            callback([{ id: 1, url: 'https://chatgpt.com/test' }]);
        }),
        sendMessage: jest.fn((tabId, message, callback) => {
            if (callback) callback({});
        })
    },
    action: {
        setIcon: jest.fn(),
        setBadgeText: jest.fn(),
        setBadgeBackgroundColor: jest.fn()
    }
};

// Mock fetch for API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob())
    })
);

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(key => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = {
    href: 'https://chatgpt.com/c/test-chat-id',
    hostname: 'chatgpt.com',
    pathname: '/c/test-chat-id'
};

// Helper to load HTML fixtures
global.loadFixture = (fixtureName) => {
    const fs = require('fs');
    const path = require('path');
    const html = fs.readFileSync(
        path.join(__dirname, 'fixtures', fixtureName),
        'utf-8'
    );
    document.body.innerHTML = html;
    return document.body;
};