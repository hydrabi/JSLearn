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
    });

    // 获取地址 公钥 私钥
    bridge.registerHandler('getAddress', function(data, responseCallback) {
        log("创建账户的参数是: ", data)
        var words = data.words
        var pass = data.pass
        var coinType = data.coinType

        var manager = new WalletCreateManager();
        responseCallback(manager.address(words, pass, coinType));
    });

    // 获取地址 公钥 私钥
    bridge.registerHandler('getMneAndInfo', function(data, responseCallback) {
        var coinType = data.coinType
        var manager = new WalletCreateManager();
        var words = manager.generate();
        var addressObj = manager.address(words, "", coinType);
        var result = {
            "words": words,
            "address": addressObj["address"],
            "pubkey": addressObj["pubkey"],
            "privkey": addressObj["privkey"]
        }
        responseCallback(manager.address(words, result, coinType));
    });



    /////////////////////////////////////////////////////////////// 瑞波XRP //////////////////////////////////////////
    // 获取瑞波的矿工费
    bridge.registerHandler('getRippleFee', function(data, responseCallback) {
        var manager = new rippleManager();
        manager.getFee().then(resultObj => {
            responseCallback(resultObj);
        });

    });

    // 获取瑞波的账户信息
    bridge.registerHandler('getRippleAccountInfo', function(data, responseCallback) {
        var address = data.address;
        var manager = new rippleManager();
        manager.getAccountInfo(address).then(resultObj => {
            responseCallback(resultObj);
        });

    });

    // 瑞波的交易 fromAddress, toAddress, fee, amount,secret 返回 {"result":true,"object":tx}
    bridge.registerHandler('rippleTranscation', function(data, responseCallback) {
        var fromAddress = data.fromAddress;
        var toAddress = data.toAddress;
        var fee = data.fee;
        var amount = data.amount;
        var secret = data.secret;
        var tag = data.tag;

        var manager = new rippleManager();
        manager.requestTransaction(fromAddress, toAddress, fee, amount, secret, tag).then(resultObj => {
            responseCallback(resultObj);
        });
    });

    // 瑞波的交易 fromAddress, toAddress, fee, amount,priKey,pubKey 返回 {"result":true,"object":tx}
    bridge.registerHandler('rippleTranscationWithKeypair', function(data, responseCallback) {
        var fromAddress = data.fromAddress;
        var toAddress = data.toAddress;
        var fee = data.fee;
        var amount = data.amount;
        var priKey = data.priKey;
        var pubKey = data.pubKey;
        var tag = data.tag;

        var manager = new rippleManager();
        manager.requestTransactionWithKeyPair(fromAddress, toAddress, fee, amount, priKey, pubKey, tag).then(resultObj => {
            responseCallback(resultObj);
        });
    });


    // 瑞波的交易记录
    bridge.registerHandler('getRippleTrans', function(data, responseCallback) {
        var address = data.address;
        let limit = data.limit;
        let maxLedgerVersion = data.maxLedgerVersion;

        var manager = new rippleManager();
        manager.getTrans(address, limit, maxLedgerVersion).then(resultObj => {
            responseCallback(resultObj);
        });

    });

    // 瑞波的交易地址是否正确
    bridge.registerHandler('isRippleValidAddress', function(data, responseCallback) {
        var address = data.address;

        var manager = new rippleManager();
        manager.isValidAddress(address).then(resultObj => {
            responseCallback(resultObj);
        });

    });

    // 根据txid获取单个瑞波交易详情
    bridge.registerHandler('getSepecificTransaction', function(data, responseCallback) {
        var txid = data.txid;

        var manager = new rippleManager();
        manager.getSepecificTransaction(txid).then(resultObj => {
            responseCallback(resultObj);
        });
    });

    // 瑞波设置是否为生产环境 
    bridge.registerHandler('setNetworkIsMainNet', function(data, responseCallback) {
        var isMainNet = data.isMainNet;

        var manager = new rippleManager();
        manager.setNetworkIsMainNet(isMainNet);
        responseCallback(resultObj);
    });

    //通过密钥生成地址
    bridge.registerHandler('rippleDeriveAddress', function(data, responseCallback) {
        var secret = data.secret;
        var manager = new rippleManager();
        manager.deriveAddress(secret).then(resultObj => {
            responseCallback(resultObj);
        });
    });

    //判断密钥是否有效
    bridge.registerHandler('rippleSecretIsValid', function(data, responseCallback) {
        var secret = data.secret;
        var manager = new rippleManager();
        manager.isValidSecret(secret).then(resultObj => {
            responseCallback(resultObj);
        });
    });

    /////////////////////////////////////////////////// BCH //////////////////////////////////////////
    // BCH 生成助记词
    bridge.registerHandler('bchGenerateMne', function(data, responseCallback) {
        var manager = new bchManager();
        let resultObj = manager.generateMne();
        responseCallback(resultObj);
    });

    //根据助记词生成cash地址
    bridge.registerHandler('bchGetCashAddressFromMne', function(data, responseCallback) {
        let mne = data.mne;
        let manager = new bchManager();
        let resultObj = manager.getCashAddressFromMne(mne);
        responseCallback(resultObj);
    });

    //根据助记词生成Legacy地址
    bridge.registerHandler('bchGetLegacyAddressFromMne', function(data, responseCallback) {
        let mne = data.mne;
        let manager = new bchManager();
        let resultObj = manager.getLegacyAddressFromMne(mne);
        responseCallback(resultObj);
    });

    //根据助记词生成私钥
    bridge.registerHandler('bchGetWif', function(data, responseCallback) {
        let mne = data.mne;
        let manager = new bchManager();
        let resultObj = manager.getWif(mne);
        responseCallback(resultObj);
    });

    //根据私钥获取cash地址
    bridge.registerHandler('bchGetCashAddressFromWif', function(data, responseCallback) {
        let wif = data.wif;
        let manager = new bchManager();
        let resultObj = manager.getCashAddressFromWif(wif);
        responseCallback(resultObj);
    });

    //根据私钥获取Legacy地址
    bridge.registerHandler('bchGetLegacyAddressFromWif', function(data, responseCallback) {
        let wif = data.wif;
        let manager = new bchManager();
        let resultObj = manager.getLegacyAddressFromWif(wif);
        responseCallback(resultObj);
    });

    //判断是否测试地址
    bridge.registerHandler('bchIsTestnetAddress', function(data, responseCallback) {
        let address = data.address;
        let manager = new bchManager();
        let resultObj = manager.isTestnetAddress(address);
        responseCallback(resultObj);
    });

    //判断是否主链地址
    bridge.registerHandler('bchIsMainnetAddress', function(data, responseCallback) {
        let address = data.address;
        let manager = new bchManager();
        let resultObj = manager.isMainnetAddress(address);
        responseCallback(resultObj);
    });

    //获取余额
    bridge.registerHandler('bchGetBalance', function(data, responseCallback) {
        let address = data.address;
        let manager = new bchManager();
        let resultObj = manager.getBalance(address).then(resultObj => {
            responseCallback(resultObj);
        });
    });

    //设置是否主链
    bridge.registerHandler('bchSetNetworkIsMainNet', function(data, responseCallback) {
        let isMainNet = data.isMainNet;
        let manager = new bchManager();
        let resultObj = manager.setNetworkIsMainNet(isMainNet);
        responseCallback(resultObj);
    });

    //将地址转换为Legacy类型
    bridge.registerHandler('bchToLegacyAddress', function(data, responseCallback) {
        let address = data.address;
        let manager = new bchManager();
        let resultObj = manager.toLegacyAddress(address);
        responseCallback(resultObj);
    });

    //判断是否Legacy地址
    bridge.registerHandler('bchIsLegacyAddress', function(data, responseCallback) {
        let address = data.address;
        let manager = new bchManager();
        let resultObj = manager.isLegacyAddress(address);
        responseCallback(resultObj);
    });

    //获取最低矿工费
    bridge.registerHandler('bchGetMinMinerFee', function(data, responseCallback) {
        let manager = new bchManager();
        let resultObj = manager.getMinMinerFee();
        responseCallback(resultObj);
    });

    //创建交易
    bridge.registerHandler('bchTrans', function(data, responseCallback) {
        let sendAddress = data.sendAddress;
        let sendMne = data.sendMne;
        let sendWif = data.sendWif;
        let sendAmount = data.sendAmount;
        let receiveAddress = data.receiveAddress;
        let minerFee = data.minerFee;

        let manager = new bchManager();
        let resultObj = manager.trans(sendAddress, sendMne, sendWif, sendAmount, receiveAddress, minerFee).then(resultObj => {
            responseCallback(resultObj);
        });
    });

    /////////////////////////////////////////////////// LTC //////////////////////////////////////////

    //设置是否主链
    bridge.registerHandler('ltcSetNetworkIsMainNet', function(data, responseCallback) {
        let isMainNet = data.isMainNet;

        let manager = new liteCoinManager();
        let resultObj = manager.setNetworkIsMainNet(isMainNet)
        responseCallback(resultObj);

    });

    //根据私钥获取地址
    bridge.registerHandler('ltcGetAddressFromWif', function(data, responseCallback) {
        let wif = data.wif;

        let manager = new liteCoinManager();
        let resultObj = manager.getAddressFromWif(wif)
        responseCallback(resultObj);

    });

    //判断私钥是否有效
    bridge.registerHandler('ltcIsWifValid', function(data, responseCallback) {
        let wif = data.wif;

        let manager = new liteCoinManager();
        let resultObj = manager.isWifValid(wif)
        responseCallback(resultObj);
    });

    //判断地址是否有效
    bridge.registerHandler('ltcIsAddressValid', function(data, responseCallback) {
        let address = data.address;

        let manager = new liteCoinManager();
        let resultObj = manager.isAddressValid(address)
        responseCallback(resultObj);
    });
})