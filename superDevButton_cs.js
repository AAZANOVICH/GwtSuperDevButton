/**********************************************************************
 *  Copyright (C) 2014 by a.azanovich@gmail.com
 *  All rights reserved.
 *
 **********************************************************************/



chrome.runtime.sendMessage({ action: "show" });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var moduleNames = request.moduleNames;
    blockUserScreen(moduleNames);
    var codeServerUrl = request.codeServerUrl;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", codeServerUrl + "recompile/" + moduleNames + "?user.agent=safari&_callback=window.callbacks.c0", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            unBlockUserScreen();
            var response = xhr.responseText.replace('window.callbacks.c0(', '').replace(');', '');
            var json = $.parseJSON(response);
            var injectedCode = "reloadInDevMode('"+ moduleNames + "', '" + codeServerUrl + "')";
            var script = document.createElement('script');
            script.appendChild(document.createTextNode(injectedCode +" ;" +
                "function reloadInDevMode(module_name, codeserver_url) {" +
                "var key = '__gwtDevModeHook:' + module_name;" +
                " sessionStorage[key] = codeserver_url + module_name + '/' + module_name + '.nocache.js';" +
                " window.location.reload();" +
                "}"));
            document.head.appendChild(script);
        }
       unBlockUserScreen();
    }
    xhr.send();
});

function  unBlockUserScreen() {
    $.unblockUI();
}

function blockUserScreen(moduleName) {
    $.blockUI({message: "Compiling module [" + moduleName +"] ...", css: {
        border: 'none',
        padding: '15px',
        backgroundColor: '#000',
        '-webkit-border-radius': '10px',
        '-moz-border-radius': '10px',
        opacity: .5,
        color: '#fff'
    } });
}



