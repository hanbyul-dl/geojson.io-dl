// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let changeColor = document.getElementById('changeColor');
let dlTiles = document.getElementById('dl-tiles');
let gists = document.getElementById('gists');

chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function(element) {
  let color = element.target.value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
        tabs[0].id,
        {code: `
            window.document.body.style.backgroundColor = "${color}";`});
  });
};

chrome.storage.sync.get('auth_token', function(data) {
  if (!data.length) {
    let authWrapper = document.getElementById('auth');
    
  }
});


fetch("https://platform.descarteslabs.com/tiles/v2/xyz", {
  method: 'get',
  headers: new Headers({
    'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc19hbm9uIjpmYWxzZSwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDg0MjQ1NjI1NjIwNzMzMjEyODMiLCJpc3MiOiJodHRwczovL2Rlc2NhcnRlc2xhYnMuYXV0aDAuY29tLyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiSGFuYnl1bCBKbyIsImdyb3VwcyI6WyJkZXNjYXJ0ZXM6dGVhbSIsInB1YmxpYyIsImJldGEiXSwiaWF0IjoxNTI1MTAxMTQyLCJleHAiOjE1MjUxMzcxNDIsImVtYWlsIjoiaGFuYnl1bEBkZXNjYXJ0ZXNsYWJzLmNvbSIsImF1ZCI6IlpPQkFpNFVST2w1Z0taSXB4eGx3T0VmeDhLcHFYZjJjIn0.rwY-m1j-W2GIy_c-PFNrRHFrwAk0h3_sZh36lUxFbtE',
    'Content-Type': 'application/json'
})})
.then(function(response) {
  return response.json();
}).then(function(myJson) {
  var products = myJson;
  var dropdown = document.createElement('select');
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
      chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
          "action": 'PRODUCT_SECLECTED',
          "value": selectedProductID
        });
     });
    }
    dlTiles.appendChild(dropdown);
});

fetch("https://api.github.com/users/hanbyul-here/gists")
.then(function(response) {
  return response.json();
}).then(function(myGists) {
  var gistDropdown = document.createElement('select');

  gistDropdown.id = 'gists-dropdown';
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
      chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
          "action": 'GIST_SELECTED',
          "value": selectedGist
        });
     });
    }
    gists.appendChild(gistDropdown);
})



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
