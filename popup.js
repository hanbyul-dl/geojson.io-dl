// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// let changeColor = document.getElementById('changeColor');

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
  if (!data.hasOwnProperty('auth_token')) {
    showAuthTokenInput();
  // if a user already saved a token
  } else {
    fetchDLTiles(data.auth_token)
    .then(function() {
      fetchGists();
    });
  }
});

function clearCurrentAuth () {
  // clear current Token first
  console.log('cleear');
  chrome.storage.sync.get(['auth_token'], function(data) {
    if (data.hasOwnProperty('auth_token')) {
      chrome.storage.sync.remove('auth_token', function() { console.log('auth token cleared')} );
    }
  });
}

function showAuthTokenInput () {

  let authWrapper = document.getElementById('auth');
  let authLabel = document.createElement('label');
  authLabel.classList.add('bm10');
  authLabel.innerHTML = 'Get your token from <a href="https://iam.descarteslabs.com/auth/credentials">DL Platform </a>';
  authWrapper.append(authLabel);
  let authTextArea = document.createElement('textarea');
  authTextArea.classList.add("w100");
  authTextArea.classList.add("bm10");
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
}

function fetchDLTiles (authToken) {
  return fetch("https://platform.descarteslabs.com/tiles/v2/xyz", {
    method: 'get',
    headers: new Headers({
      'Authorization': authToken,
      'Content-Type': 'application/json'
  })})
  .then(function(response) {
    // unauthorized
    // TO DO : deal with other error codes
    if (response.status === 401) {
      clearCurrentAuth();
      showAuthTokenInput();
      return Promise.reject();
    } else {
        return response.json();
    }
  }).then(function(myJson) {
    var products = myJson;
    let dlTiles = document.getElementById('dl-tiles');
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

        let emptyOption = createPlaceholderOption('dl tiles');
        dropdown.prepend(emptyOption);

      dropdown.onchange = function selectProduct() {
        var selectedProductID = document.getElementById('product-dropdown').value;
        // send the event to content.js
        if(!!selectedProductID.length) {

          sendMessageToContent({
            "action": 'PRODUCT_SECLECTED',
            "value": selectedProductID
          });
        }
      }
      dlTiles.appendChild(dropdown);
      return true;
  });
}

function createPlaceholderOption (name) {
  var emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = `--- Please select one of ${name} to load ---`;
  emptyOption.selected = 'selected';
  return emptyOption;
}

function fetchGists () {
  fetch("https://api.github.com/users/hanbyul-dl/gists")
  .then(function(response) {
    return response.json();
  }).then(function(myGists) {
    let gists = document.getElementById('gists');
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
    });
    let emptyOption = createPlaceholderOption('gists');
    gistDropdown.prepend(emptyOption);

      gistDropdown.onchange = function selectGist() {
        var selectedGist = document.getElementById('gists-dropdown').value;
        // send the event to content.js
        if (!!selectedGist.length) {
          sendMessageToContent({
            "action": 'GIST_SELECTED',
            "value": selectedGist
          });
        }
      }
      gists.appendChild(gistDropdown);
  })
}

function removeAuthInput () {
  let authWrapper = document.getElementById('auth');
  while (authWrapper.firstChild) {
      authWrapper.removeChild(authWrapper.firstChild);
  }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "TOKEN_SAVED") {
            removeAuthInput();
            authWrapper.innerHTML = '<span>Your token successfully saved</span>';
            fetchDLTiles(request.value);
            fetchGists();
            setTimeout(function () {
              removeAuthInput();
            }, 1000);
        }
    }
);
