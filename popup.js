// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// let changeColor = document.getElementById('changeColor');
let dlTiles = document.getElementById('dl-tiles');
let gists = document.getElementById('gists');

function sendMessageToContent (request) {
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, request);
 });
}

function sendMessageToBackground (request) {
  chrome.runtime.sendMessage(request);
}


chrome.storage.sync.get(['auth_token'], function(data) {
  // Uncomment this to clear local storage
  // chrome.storage.sync.clear(function(){console.log('cleared')});
  console.log(data.hasOwnProperty('auth_token'));

  if (!data.hasOwnProperty('auth_token')) {
    let authWrapper = document.getElementById('auth');
    let authTextArea = document.createElement('textarea');
    authTextArea.classList.add("w100");
    let authBtn = document.createElement('button');
    authBtn.type = 'button';
    authBtn.classList.add("w100");
    authBtn.textContent = 'SAVE TOKEN';
    authWrapper.appendChild(authTextArea);
    authWrapper.appendChild(authBtn);
    authBtn.onclick = function autoBtnClick () {
      sendMessageToBackground({
        action: 'SAVE_TOKEN',
        value: authTextArea.value.trim()
      });
    }
  // if a user already saved a token
  } else {
    fetchDLTiles(data.auth_token)
    .then(function() {
      fetchGists();
    });
  }
});


function fetchDLTiles (authToken) {
  return fetch("https://platform.descarteslabs.com/tiles/v2/xyz", {
    method: 'get',
    headers: new Headers({
      'Authorization': authToken,
      'Content-Type': 'application/json'
  })})
  .then(function(response) {
    return response.json();
  }).then(function(myJson) {
    var products = myJson;
    var dropdown = document.createElement('select');
    var dropdownLabel = document.createElement('label');
    dropdownLabel.textContent = 'DL tiles';
    dlTiles.appendChild(dropdownLabel);
    dropdown.classList.add('w100');
    dropdown.classList.add('mb-10');
    dropdown.id = 'product-dropdown';
    products
        .map((p) => {
          var option = document.createElement('option');
          option.value = p.id;
          option.textContent = p.id;
          dropdown.appendChild(option);
        })

      dropdown.onchange = function selectProduct() {
        var selectedProductID = document.getElementById('product-dropdown').value;
        // send the event to content.js
        sendMessageToContent({
          "action": 'PRODUCT_SECLECTED',
          "value": selectedProductID
        });
      }
      dlTiles.appendChild(dropdown);
      return true;
  });
}

function fetchGists () {
  fetch("https://api.github.com/users/hanbyul-here/gists")
  .then(function(response) {
    return response.json();
  }).then(function(myGists) {
    var gistDropdown = document.createElement('select');
    gistDropdown.classList.add('w100');
    gistDropdown.id = 'gists-dropdown';
    var gistLabel = document.createElement('label');
    gistLabel.textContent = 'Gists';
    gists.appendChild(gistLabel);
    // only fetch files ending with json. (possible it is not geojson)
    var regex = /json$/;
    myGists.filter(function(gist) {
        // TO DO: when there is more than one file
          return (regex.test(Object.keys(gist.files)[0]));
      }
    )
    .map(g => {
      var obj;
      for(var key in g.files) {
        obj = g.files[key];
      }
      return obj;
    })
    .map((gist) => {
      var option = document.createElement('option');
      option.value = gist.raw_url;
      option.textContent = gist.filename;
      gistDropdown.appendChild(option);
    })

      gistDropdown.onchange = function selectGist() {
        var selectedGist = document.getElementById('gists-dropdown').value;
        // send the event to content.js
        sendMessageToContent({
          "action": 'GIST_SELECTED',
          "value": selectedGist
        });
      }
      gists.appendChild(gistDropdown);
  })
}



//
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
