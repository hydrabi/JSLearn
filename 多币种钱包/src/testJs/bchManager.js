var bchManager = function() {
    let testAddress1 = 'bchtest:qqczttf6zdu33ymqehy27rz4ke0q9w9kkgartd80ly';
    let testAddress1Mne = 'wave because fence town word april ramp enable doctor siege good pull';

    let testAddress2 = 'bchtest:qzaahxursqzjlw5uvumdpd79t2ne9zskyumeyzd69s';
    let testAddress2Mne = 'copy target urge such ice spatial near sheriff cycle dog file twenty';

    let testAddress3 = 'bchtest:qrlp37m3ggd3m0ae7927v7puqdyffzc3hyarq35wqw';
    let testAddress3Mne = 'swarm cement any bamboo tip source relief match noodle just scorpion hint';
    let BITBOX = require('bitbox-sdk').BITBOX;
    let bitbox = new BITBOX({
        restURL: 'https://trest.bitcoin.com/v2/',
    });
    let network = 'testnet';

    function resultConfig(result, object, err) {
        return {
            "result": result,
            "object": object,
            "err": err
        };
    }


    /**
     * 根据助记词返回HdNode
     *
     * @param {mne} 助记词
     * @returns
     */
    function getHodeNodeFromMne(mne) {
        //一些node和kepair的生成
        let seedBuffer = bitbox.Mnemonic.toSeed(mne);
        // create HDNode from seed buffer
        let hdnode = bitbox.HDNode.fromSeed(seedBuffer, network);
        //Next create a BIP44 account. The 2nd argument is the BIP44 HD path.
        let account = bitbox.HDNode.derivePath(hdnode, "m/44'/145'/0'");
        // derive the first external change address HDNode which is going to spend utxo
        let changeNode = bitbox.HDNode.derivePath(account, '0/0');
        return changeNode;
    }

    /**
     * 设置当前是否主链
     *
     * @param {isMainNet} 选择主链传true 否则为false
     * @returns
     */
    this.setNetworkIsMainNet = function(isMainNet) {
        if (isMainNet) {
            bitbox = new BITBOX({
                restURL: 'https://rest.bitcoin.com/v2/',
            });
            network = 'mainnet';
        } else {
            bitbox = new BITBOX({
                restURL: 'https://trest.bitcoin.com/v2/',
            });
            network = 'testnet';
        }

        return resultConfig(true, "设置成功", "");
    }

    /**
     * 生成助记词
     *
     * @returns
     */
    this.generateMne = function() {
        try {
            return resultConfig(true, bitbox.Mnemonic.generate(128), "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    /**
     * 根据助记词生成bchcatch前缀的地址
     *
     * @param {mne} 助记词
     */
    this.getCashAddressFromMne = function(mne) {
        try {
            let changeNode = getHodeNodeFromMne(mne);
            // get the cash address
            let cashAddress = bitbox.HDNode.toCashAddress(changeNode);
            return resultConfig(true, cashAddress, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    /**
     * 根据助记词生成Legacy类型地址
     *
     * @param {mne} 助记词
     */
    this.getLegacyAddressFromMne = function(mne) {
        try {
            let changeNode = getHodeNodeFromMne(mne);
            let legacyAddress = bitbox.HDNode.toLegacyAddress(changeNode);
            return resultConfig(true, legacyAddress, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    /**
     * 根据私钥获取bchcatch前缀的地址
     *
     * @param {wif} 私钥
     * @returns
     */
    this.getCashAddressFromWif = function(wif) {
        try {
            let keyPair = bitbox.ECPair.fromWIF(wif);
            let cashAddress = bitbox.ECPair.toCashAddress(keyPair);
            return resultConfig(true, cashAddress, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }

    }

    /**
     * 根据私钥获取Legacy类型的地址
     *
     * @param {wif} 私钥
     * @returns
     */
    this.getLegacyAddressFromWif = function(wif) {
        try {
            let keyPair = bitbox.ECPair.fromWIF(wif);
            let legacyAddress = bitbox.ECPair.toLegacyAddress(keyPair);
            return resultConfig(true, legacyAddress, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }

    }

    /**
     * 判断是否是测试链地址
     *
     * @param {*} address
     * @returns
     */
    this.isTestnetAddress = function(address) {
        try {
            let result = bitbox.Address.isTestnetAddress(address);
            return resultConfig(true, result, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    /**
     * 判断地址是否是主链地址
     *
     * @param {address} 地址
     * @returns
     */
    this.isMainnetAddress = function(address) {
        try {
            let result = bitbox.Address.isMainnetAddress(address);
            return resultConfig(true, result, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    /**
     * 根据助记词获取私钥
     *
     * @param {mne} 助记词
     */
    this.getWif = function(mne) {
        try {

            let changeNode = getHodeNodeFromMne(mne);
            let keyPair = bitbox.HDNode.toKeyPair(changeNode);
            let wif = bitbox.ECPair.toWIF(keyPair);
            return resultConfig(true, wif, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    /**
     * 将地址转换为Legacy类型
     *
     * @param {需要转换的地址} address
     * @returns
     */
    this.toLegacyAddress = function(address) {
        try {
            let legacyAddress = bitbox.Address.toLegacyAddress(address);
            return resultConfig(true, legacyAddress, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    /**
     * 判断是否Legacy地址
     *
     * @param {需要判断的地址} address
     * @returns
     */
    this.isLegacyAddress = function(address) {
        try {
            let result = bitbox.Address.isLegacyAddress(address);
            return resultConfig(true, result, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    /**
     * 获取最低矿工费
     *
     * @returns
     */
    this.getMinMinerFee = function() {
        try {
            //假设最低矿工费 输入只有一笔 输出为两笔 
            let fee = bitbox.BitcoinCash.getByteCount({ P2PKH: 1 }, { P2PKH: 2 });
            //又聪转化为正常单位
            fee = bitbox.BitcoinCash.toBitcoinCash(fee);
            return resultConfig(true, fee, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    /**
     * 获取余额
     *
     * @param {*} 地址
     * @returns
     */
    this.getBalance = async function getBalance(address) {
        try {
            let details = await bitbox.Address.details(address);
            return resultConfig(true, details, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }


    /**
     * 获取未花费的交易输出
     *
     * @param {*} 地址
     * @returns
     */
    this.getUnSpent = async function(address) {
        try {
            let utxo = await bitbox.Address.utxo(address);
            return resultConfig(true, utxo, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }


    /**
     * 获取交易记录 （用浏览器地址 不用这个）
     *
     * @param {*} 地址
     * @returns
     */
    this.getTransaction = async function(address) {
        try {
            let transaction = await bitbox.Address.transactions(address);
            return resultConfig(true, transaction, "");
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, "", err.message);
        }
    }


    // 排序utxo数组 amount从小到大
    function sortUTXO(utxo) {
        if (Array.isArray(utxo)) {
            if (utxo.length > 0) {
                function compare(amount) {
                    return function(a, b) {
                        var amount1 = a[amount];
                        var amount2 = b[amount];
                        return amount1 - amount2;
                    }
                }

                return utxo.sort(compare("amount"));
            }
        }

        return null;
    }


    /**
     * 创建交易
     *
     * @param {sendAddress} 发送地址
     * @param {sendMne} 发送方的助记词 与私钥2选1
     * @param {sendWif} 发送方的私钥 与助记词2选1
     * @param {sendAmount} 发送的数量
     * @param {receiveAddress} 接收地址
     * @param {minerFee} 矿工费
     * @returns
     */
    this.trans = async function trans(sendAddress, sendMne, sendWif, sendAmount, receiveAddress, minerFee) {
        console.log("start trans");

        //猜测的最大矿工费 假设最大的输入笔数为6笔
        let maxByteCount = bitbox.BitcoinCash.getByteCount({ P2PKH: 6 }, { P2PKH: 2 });
        //要发送的金额 转成聪
        const sendAmountSatoshis = bitbox.BitcoinCash.toSatoshi(sendAmount);
        console.log("发送金额为:" + sendAmountSatoshis);

        //utxo请求
        let utxos;
        try {
            utxos = await bitbox.Address.utxo(sendAddress);
            console.log("success uxto为：" + JSON.stringify(utxos));
        } catch (err) {
            //请求失败
            console.log(err);
            return resultConfig(false, "", err.message);
        }

        //已经排序的数组
        let sortUTXOList = sortUTXO(utxos["utxos"]);
        if (sortUTXOList.length == 0) {
            return resultConfig(false, "", "无交易记录");
        }
        console.log("已经排序的数组：" + JSON.stringify(sortUTXOList));

        //需要使用的队列
        let unSpentArr = Array();
        //未使用账单选择支付的总和 单位为聪
        let unSpentTotalAmountSatoshis = 0;
        //除去utxo每一笔后剩余的值 用以判断utxo总值是否足够转账
        let leftAmount = sendAmountSatoshis + maxByteCount;
        console.log("leftAmount = " + leftAmount);
        //遍历已排序的数组 将遍历到每一笔账单的值加起来 直到超过或者等于要发送的值为止

        for (let i = 0; i < sortUTXOList.length; i++) {
            let utxo = sortUTXOList[i];
            let amount = utxo["satoshis"];
            //utxo 的 amount数量统计
            unSpentTotalAmountSatoshis += amount;
            //utxo选择的数组添加
            unSpentArr.push(utxo);
            //计算还差多少
            leftAmount -= amount;
            console.log("当前leftAmount：" + leftAmount);
            //足够支付就退出循环
            if (leftAmount <= 0) {
                break;
            }
        }

        if (leftAmount > 0) {
            console.log("余额不足以转账");
            return resultConfig(false, "", "余额不足以转账");
        }

        console.log("选择用以转账的账单：" + JSON.stringify(unSpentArr));

        //计算最小的矿工费 单位为聪
        let minMinerFeeSatoshis = bitbox.BitcoinCash.getByteCount({ P2PKH: unSpentArr.length }, { P2PKH: 2 });
        //真正使用的矿工费
        let realMinerFeeSatoshis = bitbox.BitcoinCash.toSatoshi(minerFee);
        if (realMinerFeeSatoshis < minMinerFeeSatoshis) {
            realMinerFeeSatoshis = minMinerFeeSatoshis;
        }
        console.log("实际矿工费为: " + realMinerFeeSatoshis);

        //计算找零
        let changeAmountSatoshis = unSpentTotalAmountSatoshis - realMinerFeeSatoshis - sendAmountSatoshis;
        console.log("实际找零为: " + changeAmountSatoshis);

        let keyPair = null;
        let transactionBuilder = new bitbox.TransactionBuilder(network);
        //如果传入的是助记词
        if (sendMne.length > 0) {
            //一些node和kepair的生成
            let seedBuffer = bitbox.Mnemonic.toSeed(sendMne);
            // create HDNode from seed buffer
            let hdnode = bitbox.HDNode.fromSeed(seedBuffer, network);
            //Next create a BIP44 account. The 2nd argument is the BIP44 HD path.
            let account = bitbox.HDNode.derivePath(hdnode, "m/44'/145'/0'");
            // derive the first external change address HDNode which is going to spend utxo
            let changeNode = bitbox.HDNode.derivePath(account, '0/0');
            // get the cash address
            let cashAddress = bitbox.HDNode.toCashAddress(changeNode);
            console.log("得到的找零地址: " + cashAddress);
            keyPair = bitbox.HDNode.toKeyPair(changeNode);
        }
        //如果传入的是私钥
        else if (sendWif.length > 0) {
            keyPair = bitbox.ECPair.fromWIF(sendWif);
        } else {
            return resultConfig(false, "", "交易需要传入助记词或者私钥");
        }

        //遍历选择的utxo
        for (let i = 0; i < unSpentArr.length; i++) {
            let utxo = unSpentArr[i];
            let txid = utxo["txid"];
            let vout = utxo["vout"];
            let satoshis = utxo["satoshis"];
            console.log("遍历得到" + txid + " " + vout + " " + satoshis);
            //每一笔输入都要添加
            transactionBuilder.addInput(
                txid,
                vout
            );
        }

        //添加输出 接受者的地址和要发送的数量 单位为聪
        transactionBuilder.addOutput(
            receiveAddress,
            sendAmountSatoshis
        );

        //添加输出 发送者的地址和找零的数量 单位为聪
        transactionBuilder.addOutput(
            sendAddress,
            changeAmountSatoshis
        );

        //遍历选择的utxo 顺序不能调转 必须要放在addOutput之后
        for (let i = 0; i < unSpentArr.length; i++) {
            let utxo = unSpentArr[i];
            let satoshis = utxo["satoshis"];
            console.log("遍历得到 " + satoshis);

            let redeemScript;
            //每一笔输入都要签名
            transactionBuilder.sign(
                i,
                keyPair,
                redeemScript,
                transactionBuilder.hashTypes.SIGHASH_ALL,
                satoshis
            );
        }

        // build tx
        let tx = transactionBuilder.build();
        // output rawhex
        let hex = tx.toHex();
        console.log("tx hex is " + hex);

        try {
            let result = await bitbox.RawTransactions.sendRawTransaction(hex);
            return resultConfig(true, result, "");
        } catch (err) {
            console.log(err.message);
            return resultConfig(false, "", err.message);
        }
    }
}