/*这段代码是固定的，必须要放到js中*/
function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        return callback(WebViewJavascriptBridge);
    }
    if (window.WVJBCallbacks) {
        return window.WVJBCallbacks.push(callback);
    }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() {
        document.documentElement.removeChild(WVJBIframe)
    }, 0)
}

/*与OC交互的所有JS方法都要放在此处注册，才能调用通过JS调用OC或者让OC调用这里的JS*/
setupWebViewJavascriptBridge(function(bridge) {
    var uniqueId = 1

    function log(message, data) {
        alert(message + JSON.stringify(data))
    }
    /* Initialize your app here */

    /*JS给ObjC提供公开的API，在ObjC端可以手动调用JS的这个API。接收ObjC传过来的参数，且可以回调ObjC*/
    // 生成助记词
    bridge.registerHandler('getMnemonic', function(data, responseCallback) {
        var manager = new WalletCreateManager();
        var words = manager.generate();
        responseCallback(words)
    })

    // 
    bridge.registerHandler('getAddress', function(data, responseCallback) {
        log("创建账户的参数是: ", data)
        var words = data.words
        var pass = data.pass
        var coinType = data.coinType

        var manager = new WalletCreateManager();
        responseCallback(manager.address(words, pass, coinType));
    })
})