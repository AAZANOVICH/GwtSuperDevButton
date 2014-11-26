/**********************************************************************
*  Copyright (C) 2014 by a.azanovich@gmail.com
*  All rights reserved.
*
**********************************************************************/

$(function () {

    chrome.storage.sync.get("codeServerUrl", function(items) {
        var codeServerUrl =  items.codeServerUrl;
        if (typeof codeServerUrl === "undefined" || codeServerUrl.trim() == '') {
            // set default code server url
            codeServerUrl = "http://localhost:9876/";
        }
        $("#codeServerUrl").val(codeServerUrl);
        preloadAvailableModules(codeServerUrl);
    })

    $("#codeServerUrl").on("change", function(){
        // clear values first
        $("#availableModules > option").each(function(){
            this.remove()
        });
        // reload active modules
        preloadAvailableModules($("#codeServerUrl").val());
    })



    function preloadAvailableModules(codeServerUrl) {
        setButtonsEnabled(false);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", codeServerUrl , true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var responseHtml = xhr.responseText;
                var moduleNames = parseModuleNames(responseHtml);
                var moduleItem;
                $.each(moduleNames, function(index, item) {
					if(item != '') {
						moduleItem = "<option value='" + item +"'>" + item + "</option>";
						$("#availableModules").append(moduleItem);
						setButtonsEnabled(true);
					}
                });
            }
        }
        xhr.send();
    }


    function parseModuleNames(html) {
        var scriptText = $(html).filter('script').first().text();
        var modules = scriptText.replace('window.config = {"moduleNames":["','').replace('"]};','').trim();
        var arr = modules.split(',');
		  $.each(arr, function(index, item) {
                 arr[index] = item.replace('\"',""); 
          });
		
        return arr;
    }


    function saveCodeServerUrl(codeServerUrl) {
        chrome.storage.sync.set({ "codeServerUrl" : codeServerUrl }, function () {
            console.log("Code Server Url is updated : " + codeServerUrl);
        });
    }

    function saveLastBuildConfig(selectedModule,codeServerUrl) {
        var lastBuildUrl = selectedModule + "|" + codeServerUrl;
        chrome.storage.sync.set({ "lastBuildUrl" : lastBuildUrl }, function () {});
    }

    function setButtonsEnabled(enabled) {
        $('#compileBtn').prop('disabled', !enabled);
    }

    $('#compileBtn').click(function () {

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var selectedModule = $("#availableModules").val();
            var codeServerUrl =  $("#codeServerUrl").val();

            saveCodeServerUrl(codeServerUrl);
            saveLastBuildConfig(selectedModule,codeServerUrl);
            chrome.tabs.sendMessage(tabs[0].id, { moduleNames: selectedModule, codeServerUrl : codeServerUrl });
            window.close();
        });
    });

});






