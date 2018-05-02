document.addEventListener('CUSTOM_PRODUCT_SECLECTED', function(e) {
  let dlTileLayer;
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
