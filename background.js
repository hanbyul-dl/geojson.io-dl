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
        fetchDLProducts();
      });
    }
 });



//
//
function fetchDLProducts () {
  chrome.storage.sync.get(['auth_token'], function(data) {
    if (data.hasOwnProperty('auth_token')) {
      let authToken = data.auth_token;
      return fetch("https://platform.descarteslabs.com/tiles/v2/xyz", {
        method: 'get',
        headers: new Headers({
          'Authorization': authToken,
          'Content-Type': 'application/json'
      })})
      .then(function(response) {
        // TO DO : deal with other error codes
        if (response.status === 401) {
          // unauthorized
          chrome.runtime.sendMessage({
            action: 'DL_AUTHORIZATION_FAIL'
          });
          return Promise.reject('not authorized');
        } else {
            return response.json();
        }
      })
      .then(function(myJson) {
        chrome.runtime.sendMessage({
          action: 'DL_PRODUCTS_FETCHED',
          value: myJson
        });
        chrome.storage.sync.set({'dl_products': myJson}, function() {
          console.log('products fetched');
        })
      });
    }
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.action === "FETCH_DL_PRODUCTS") {
        fetchDLProducts();
      }
    }
)




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
// );
