// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

function sendMessageToContent(request) {
  chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, request);
  });
}

function sendMessageToBackground(request) {
  chrome.runtime.sendMessage(request);
}

function clearCurrentAuth() {
  // clear current Token first
  chrome.storage.sync.get(["auth_token"], function(data) {
    if (data.hasOwnProperty("auth_token")) {
      chrome.storage.sync.remove("auth_token", function() {
        console.log("auth token cleared");
      });
    }
  });
}

function showAuthTokenInput() {
  let authWrapper = document.getElementById("auth");
  let authLabel = document.createElement("label");
  authLabel.classList.add("bm10");
  authLabel.innerHTML =
    'Get your token from <a href="https://iam.descarteslabs.com/auth/credentials" target="_blank">DL Platform </a>';
  authWrapper.append(authLabel);
  let authTextArea = document.createElement("textarea");
  authTextArea.classList.add("w100");
  authTextArea.classList.add("bm10");
  let authBtn = document.createElement("button");
  authBtn.type = "button";
  authBtn.classList.add("w100");
  authBtn.textContent = "SAVE TOKEN";
  authWrapper.appendChild(authTextArea);
  authWrapper.appendChild(authBtn);
  authBtn.onclick = function autoBtnClick() {
    sendMessageToBackground({
      action: "SAVE_TOKEN",
      value: authTextArea.value.trim()
    });
  };
}

function showFetchNewDLProductsButton(parentElem) {
  let fetchButton = document.createElement("button");
  fetchButton.type = "button";
  fetchButton.textContent = "Reload";
  fetchButton.classList.add("w100");
  fetchButton.onclick = function() {
    // delete current dl product dropdown
    while (parentElem.firstChild) {
      parentElem.removeChild(parentElem.firstChild);
    }

    //displayLoadingStatus(parentElem, true);

    sendMessageToBackground({
      action: "FETCH_DL_PRODUCTS"
    });
  };
  parentElem.appendChild(fetchButton);
}

function showDLProducts(products) {
  let dlTiles = document.getElementById("dl-tiles");

  var dropdownLabel = document.createElement("label");
  dropdownLabel.textContent = "DL tiles";

  var dropdown = document.createElement("select");
  dropdown.classList.add("w100");
  dropdown.classList.add("mb-10");
  dropdown.id = "product-dropdown";

  dropdown.onchange = function selectProduct() {
    var selectedProductID = document.getElementById("product-dropdown").value;
    // send the event to content.js
    if (!!selectedProductID.length) {
      sendMessageToContent({
        action: "PRODUCT_SECLECTED",
        value: selectedProductID
      });
    }
  };

  products.map(p => {
    var option = document.createElement("option");
    option.value = p.id;
    option.textContent = p.id;
    dropdown.appendChild(option);
  });

  let emptyOption = createPlaceholderOption("dl tiles");
  dropdown.prepend(emptyOption);

  // displayLoadingStatus(dlTiles, false);
  dlTiles.appendChild(dropdownLabel);
  dlTiles.appendChild(dropdown);
  showFetchNewDLProductsButton(dlTiles);
}

function createPlaceholderOption(name) {
  var emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = `--- Please select one of ${name} to load ---`;
  emptyOption.selected = "selected";
  return emptyOption;
}

function fetchGists() {
  let gists = document.getElementById("gists");

  let gistDropdown = document.createElement("select");
  gistDropdown.classList.add("w100");
  gistDropdown.id = "gists-dropdown";

  gistDropdown.onchange = function selectGist() {
    var selectedGist = document.getElementById("gists-dropdown").value;
    // send the event to content.js
    if (!!selectedGist.length) {
      sendMessageToContent({
        action: "GIST_SELECTED",
        value: selectedGist
      });
    }
  };

  let gistLabel = document.createElement("label");
  gistLabel.textContent = "Gists";

  displayLoadingStatus(gists, true);

  fetch("https://api.github.com/users/hanbyul-dl/gists")
    .then(function(response) {
      return response.json();
    })
    .then(function(myGists) {
      // only fetch files ending with json. (possible it is not geojson)
      var regex = /json$/;
      myGists
        .filter(function(gist) {
          // TO DO: when there is more than one file
          return regex.test(Object.keys(gist.files)[0]);
        })
        .map(g => {
          var obj;
          for (var key in g.files) {
            obj = g.files[key];
          }
          return obj;
        })
        .map(gist => {
          var option = document.createElement("option");
          option.value = gist.raw_url;
          option.textContent = gist.filename;
          gistDropdown.appendChild(option);
        });
      let emptyOption = createPlaceholderOption("gists");
      gistDropdown.prepend(emptyOption);

      displayLoadingStatus(gists, false);
      gists.appendChild(gistLabel);
      gists.appendChild(gistDropdown);
    });
}

function removeAuthInput() {
  let authWrapper = document.getElementById("auth");
  while (authWrapper.firstChild) {
    authWrapper.removeChild(authWrapper.firstChild);
  }
}

function displayLoadingStatus(elem, show) {
  if (show) {
    let loadingText = document.createElement("span");
    loadingText.id = elem.id + "-loading";
    loadingText.textContent = "loading...";
    elem.appendChild(loadingText);
  } else {
    let loadingText = document.getElementById(elem.id + "-loading");
    console.log(elem.id + "-loading");
    loadingText.parentNode.removeChild(loadingText);
  }
}

// Remove auth token input when token is saved
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "TOKEN_SAVED") {
    removeAuthInput();
    let authWrapper = document.getElementById("auth");
    authWrapper.innerHTML = "<span>Your token successfully saved</span>";
  } else if (request.action === "DL_AUTHORIZATION_FAIL") {
    showAuthTokenInput();
  } else if (request.action === "DL_PRODUCTS_FETCHED") {
    // displayLoadingStatus(document.getElementById("dl-tiles"), false);
    showDLProducts(request.value);
  }
});

chrome.storage.sync.get(["dl_products"], function(data) {
  if (!data.hasOwnProperty("dl_products")) {
    showAuthTokenInput();
    // if a user already saved a token
  } else {
    showDLProducts(data.dl_products);
    fetchGists();
  }
});
