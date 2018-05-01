// injecting a script that is going to interact actual browser console
var s = document.createElement('script');
s.src = chrome.extension.getURL('inject.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.remove();
};

// Event listener
document.addEventListener('RW759_connectExtension', function(e) {
    // e.detail contains the transferred data (can be anything, ranging
    // from JavaScript objects to strings).
    // Do something, for example:
    console.log('got the event')
    console.log(e.detail);
    // alert(JSON.stringify(e.detail));
    // chrome.runtime.sendMessage({
    //   action: "RECEIVED_PRODUCTS",
    //   products: e.detail.products
    // }, function(response) {
    //   console.log('connected')
    // });
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('from content');
    console.log(request);
    if (request.action === 'PRODUCT_SECLECTED') {
     document.dispatchEvent(new CustomEvent('CUSTOM_PRODUCT_SECLECTED', {
       detail: request.value
     }));
   }
   if (request.action === 'GIST_SELECTED') {
     document.dispatchEvent(new CustomEvent('CUSTOM_GIST_SELECTED', {
       detail: request.value
     }));
   }
  }
);
