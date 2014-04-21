/**********************************************************************
*  Copyright (C) 2014 by a.azanovich@gmail.com
*  All rights reserved.
*
**********************************************************************/

chrome.commands.onCommand.addListener(function(command) {

    chrome.storage.sync.get("lastBuildUrl", function(items) {
        var lastBuildUrl =  items.lastBuildUrl;
        var tmp = lastBuildUrl.split("|");
        var moduleName = tmp[0];
        var codeServerUrl = tmp[1];

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { moduleNames: moduleName, codeServerUrl : codeServerUrl });
        });
    })
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "show") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.pageAction.show(tabs[0].id);
        });
    }
});








