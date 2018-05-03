let DLTileHandler = (function() {

  var dlLayer = null;

  function _destoryDLLayer() {
    dlLayer.off('loading');
    dlLayer.off('load');
    window.api.map.removeLayer(dlLayer);
    dlLayer = null;
  }

  function addDLLayer(tileID) {
    if (dlLayer) {
      _destoryDLLayer();
    }

    let tileTemplate =` https://platform.descarteslabs.com/raster/v2/xyz/${tileID}/{z}/{x}/{y}.png`;
    dlLayer = L.tileLayer(tileTemplate);

    dlLayer.on('tileloadstart', function tileLoadingStarted () {
      console.log('DL tile loading started')
    });

    // When tile loading finished
    dlLayer.on('load', function tileLoaded() {
      console.log('DL tile loading ended')
    });

    window.api.map.addLayer(dlLayer);
  }
  return {
    addDLLayer: addDLLayer
  }
})();



document.addEventListener('CUSTOM_PRODUCT_SECLECTED', function(e) {
  console.log('from injectsed script: I got the event for CUSTOM PRODUCT SELECTED');
  var tileID = e.detail;

  // It would be fantastic to know an ideal zoomoffset for each tileset
  DLTileHandler.addDLLayer(tileID);

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
