let dlTileLayer;

document.addEventListener('CUSTOM_PRODUCT_SECLECTED', function(e) {
  console.log('from injectsed script: I got the event for CUSTOM PRODUCT SELECTED');
  var tileID = e.detail;
  var tileTemplate =` https://platform.descarteslabs.com/raster/v2/xyz/${tileID}/{z}/{x}/{y}.png`;
  if (dlTileLayer) {
    dlTileLayer.setUrl(tileTemplate)
  } else {
    dlTileLayer= L.tileLayer(tileTemplate);
    window.api.map.addLayer(dlTileLayer);
  }
});

document.addEventListener('CUSTOM_GIST_SELECTED', function(e) {
  console.log('from injectsed script: I got the event for CUSTOM GIST SELECTED');
  var gistAddress = e.detail;
  fetch(gistAddress)
  .then(function(response) {
    return response.json();
  }).then(function(myJson) {
    window.api.data.set({ map: myJson})
  });
});



setTimeout(function() {

    /* Example: Send data from the page to your Chrome extension */

    console.log('loaded');

    // fetch("https://platform.descarteslabs.com/tiles/v2/xyz", {
    //   method: 'get',
    //   headers: new Headers({
    //     'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc19hbm9uIjpmYWxzZSwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDg0MjQ1NjI1NjIwNzMzMjEyODMiLCJpc3MiOiJodHRwczovL2Rlc2NhcnRlc2xhYnMuYXV0aDAuY29tLyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiSGFuYnl1bCBKbyIsImdyb3VwcyI6WyJkZXNjYXJ0ZXM6dGVhbSIsInB1YmxpYyIsImJldGEiXSwiaWF0IjoxNTI1MTAxMTQyLCJleHAiOjE1MjUxMzcxNDIsImVtYWlsIjoiaGFuYnl1bEBkZXNjYXJ0ZXNsYWJzLmNvbSIsImF1ZCI6IlpPQkFpNFVST2w1Z0taSXB4eGx3T0VmeDhLcHFYZjJjIn0.rwY-m1j-W2GIy_c-PFNrRHFrwAk0h3_sZh36lUxFbtE',
    //     'Content-Type': 'application/json'
    // })})
    // .then(function(response) {
    //   return response.json();
    // }).then(function(myJson) {
    //   console.log("this should fetch static tiles")
    //   document.dispatchEvent(new CustomEvent('RW759_connectExtension', {
    //       detail: {
    //         products: myJson
    //       }
    //   }));
    // })
    // fetch("https://gist.githubusercontent.com/hanbyul-dl/875d8fcd95dde3af02506dfbd5f6f2f4/raw/1f9e264d0ef329cc42fcefdde6c59224533bd004/water.geojson")
    // .then(function(response) {
    //   return response.json();
    // }).then(function(myJson) {
    //   api_.data.set({map: myJson})
    // });

}, 0);
