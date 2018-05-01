// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        // activate only on geojson.io
        pageUrl: {hostEquals: 'geojson.io'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// Get message from content.js, then forward it to popup.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // forward request to popup.js
    // chrome.runtime.sendMessage(request);
    if (request.action === 'SAVE_TOKEN') {
      chrome.storage.sync.set({'auth_token': request.value}, function() {
        //TO DO: refresh the popup with saved token
        console.log('Token is saved.');
        // send the message to popup to close
        chrome.runtime.sendMessage({
          action: 'TOKEN_SAVED',
          value: request.value
        });
      });
    }
 }


 // chrome.runtime.onMessage.addListener(
 //     function(request, sender, sendResponse) {
 //         if (request.action === "RECEIVED_PRODUCTS") {
 //             //  To do something
 //             var dropdown = document.createElement('select');
 //             request.products
 //                 .map((p) => {
 //                   var option = document.createElement('option');
 //                   option.value = p.id;
 //                   option.textContent = p.id;
 //                   dropdown.appendChild(option);
 //                 })
 //               document.getElementById('sample').appendChild(dropdown);
 //             //document.getElementById('sample').textContent = JSON.stringify(request.products);
 //         }
 //     }
 // );
);
