'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener(function (msg, sender) {
    if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
        // enable the page-action for the requesting tab
        chrome.pageAction.show(sender.tab.id);
    }
});


console.log('\'Allo \'Allo! Event Page for Page Action');