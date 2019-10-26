var liteCoinManager = function() {

    let network = 'testnet';
    let litecore = require("litecore-lib");

    function resultConfig(result, object, err) {
        return {
            "result": result,
            "object": object,
            "err": err
        };
    }

    /**
     * 设置当前是否主链
     *
     * @param {isMainNet} 选择主链传true 否则为false
     * @returns
     */
    this.setNetworkIsMainNet = function(isMainNet) {
        if (isMainNet) {
            network = 'livenet';
        } else {
            network = 'testnet';
        }
        return resultConfig(true, "设置成功", "");
    }

    /**
     * 根据私钥获取地址
     *
     * @param {wif} 私钥
     * @returns
     */
    this.getAddressFromWif = function(wif) {

        let privateKey = new litecore.PrivateKey(wif);

        // let wif2 = privateKey.toWIF();
        // console.log(wif2);

        var address = privateKey.toAddress(network);
        let addressStr = address.toString();
        return resultConfig(true, addressStr, "");
    }

    //判断私钥是否有效
    this.isWifValid = function(wif) {
        let result = litecore.PrivateKey.isValid(wif);
        return resultConfig(true, result, "");
    }

    //判断地址是否有效
    this.isAddressValid = function(address) {
        let result = litecore.Address.isValid(address);
        return resultConfig(true, result, "");
    }
}