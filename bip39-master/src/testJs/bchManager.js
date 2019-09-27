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

    //设置当前是否主链
    var setNetworkIsMainNet = function(isMainNet) {
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

        return resultConfig(true, "设置成功", null);
    }

    //获取余额
    this.getBalance = async function getBalance(address) {
        try {
            let details = await bitbox.Address.details(address);
            return resultConfig(true, details, null);
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, null, err.message);
        }
    }

    //获取未花费的交易输出
    var getUnSpent = async function(address) {
        try {
            let utxo = await bitbox.Address.utxo(address);
            return resultConfig(true, utxo, null);
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, null, err.message);
        }
    }

    //获取交易记录
    var getTransaction = async function(address) {
        try {
            let transaction = await bitbox.Address.transactions(address);
            return resultConfig(true, transaction, null);
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, null, err.message);
        }
    }

    //判断是否是测试链地址
    var isTestnetAddress = async function(address) {
        try {
            let result = bitbox.Address.isTestnetAddress(address);
            return resultConfig(true, result, null);
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, null, err.message);
        }
    }

    //判断是否是主链地址
    var isMainnetAddress = async function(address) {
        try {
            let result = bitbox.Address.isMainnetAddress(address);
            return resultConfig(true, result, null);
        } catch (err) {
            console.error(err.message);
            return resultConfig(false, null, err.message);
        }
    }

    var getPrivateKey = function(mne) {
        var keyPair = bitbox.Mnemonic.toKeypairs(mne);
        console.log("success 私钥为：" + JSON.stringify(keyPair));
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

    async function trans(sendAddress, sendMne, sendAmount, receiveAddress, minerFee) {
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
            return resultConfig(false, null, err.message);
        }

        //已经排序的数组
        let sortUTXOList = sortUTXO(utxos["utxos"]);
        if (sortUTXOList.length == 0) {
            return resultConfig(false, null, "无交易记录");
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
            return resultConfig(false, null, "余额不足以转账");
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
        let transactionBuilder = new bitbox.TransactionBuilder(network);
        let keyPair = bitbox.HDNode.toKeyPair(changeNode);

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
        bitbox.RawTransactions.sendRawTransaction(hex).then(
            result => {
                console.log("交易结果为：" + result);
                return resultConfig(true, result, null);
            },
            err => {
                console.log(err)
                return resultConfig(false, null, err.message);
            }
        )

    }

    ////////////////////////////测试

    // getBalance(testAddress2).then(object => {
    //     var result = object["result"]
    //     if (result) {
    //         console.log("success 余额为：" + JSON.stringify(object["object"]));
    //     }
    // });

    // getUnSpent(testAddress1).then(object => {
    //     var result = object["result"]
    //     if (result) {
    //         console.log("success uxto为：" + JSON.stringify(object["object"]));
    //     }
    // });

    // getTransaction(testAddress1).then(object => {
    //     var result = object["result"]
    //     if (result) {
    //         console.log("success 交易记录为：" + JSON.stringify(object["object"]));
    //     }
    // });

    // getPrivateKey("wave because fence town word april ramp enable doctor siege good pull");

    // trans(testAddress1, testAddress1Mne, 0.00021, testAddress2, 0).then({

    // });
}