var rippleManager = function() {

    var api = new ripple.RippleAPI({
        // server: 'wss://s1.ripple.com/'
        //测试链
        server: 'wss://s.altnet.rippletest.net:51233'
    });

    var address1 = "rJqGsa3Dd5PC8fAcZGzia6BJjk383UBUtx";
    var address1Secret = "sngugX7wotDp6ZfyamgkGWhCKKFit";

    var address2 = "rswdUBJwu1dug8zTKmVS7fWGMvyoFMd2fH";
    var address2Secret = "ss2mJHyhxCh9aDLRtDfZp2YPvvdUL";
    //默认矿工费用
    var difaultFee = "0.000013";

    //配置结果
    function resultConfig(result, object, err) {
        return {
            "result": result,
            "object": object,
            "err": err
        };
    }

    //设置主链
    this.setNetworkIsMainNet = function(isMainNet) {
        try {
            if (isMainNet) {
                api = new ripple.RippleAPI({
                    //正式链
                    server: 'wss://s1.ripple.com/'
                });
            } else {
                api = new ripple.RippleAPI({
                    //测试链
                    server: 'wss://s.altnet.rippletest.net:51233'
                });

                console.log(`api is ${JSON.stringify(api)}`);
            }
            return resultConfig(true, "设置成功", "");
        } catch (err) {
            return resultConfig(false, "设置失败", "");
        }
    }

    // 获取用户信息
    this.getAccountInfo = async function accountInfo(address) {
        try {
            await api.connect();
            const info = await api.getAccountInfo(address);
            console.log(address + "的信息是 " + JSON.stringify(info));
            return resultConfig(true, info, "");
        } catch (err) {
            console.log(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    //获取最低矿工费用
    this.getFee = async function getFee() {
        try {
            await api.connect();

            const fee = await api.getFee();
            console.log("费用是 " + fee);
            return resultConfig(true, fee, "");
        } catch (err) {
            console.log(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    //转账
    this.requestTransaction = async function requestTransaction(fromAddress, toAddress, fee, amount, secret, tag = 0) {

        await api.connect();
        const ledger = await api.getLedger();
        //最后总账序列 是所有交易的可选参数。这指示Radar网络，截至具体总账实例，交易必须被验证。交易将永远不会被纳入一个有更大序列号的总账实例。
        const lastLedgerSequence = ledger.ledgerVersion + 4;

        const transaction = {
            "TransactionType": "Payment",
            "Account": fromAddress,
            "Amount": api.xrpToDrops(amount), // Same as "Amount": "22000000"
            "Destination": toAddress,
            "LastLedgerSequence": lastLedgerSequence,
            "SourceTag": parseInt(tag)
        };

        const instructions = {
            "fee": fee,
        };

        //准备transcation
        const preparedTx = await api.prepareTransaction(transaction, instructions);
        //最大总账版本号
        const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
        const txJson = preparedTx.txJSON;
        //获取签名
        const response = api.sign(txJson, secret);
        //最后交易的签名
        const txBlob = response.signedTransaction;
        //交易id
        const txID = response.id;

        //提交的结果
        try {
            const result = await api.submit(txBlob);
            return resultConfig(true, txID, "");
        } catch (err) {
            console.log(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    //通过keypair转账
    this.requestTransactionWithKeyPair = async function(fromAddress, toAddress, fee, amount, priKey, pubKey, tag = 0) {

        await api.connect();
        const ledger = await api.getLedger();
        //最后总账序列 是所有交易的可选参数。这指示Radar网络，截至具体总账实例，交易必须被验证。交易将永远不会被纳入一个有更大序列号的总账实例。
        const lastLedgerSequence = ledger.ledgerVersion + 4;

        const transaction = {
            "TransactionType": "Payment",
            "Account": fromAddress,
            "Amount": api.xrpToDrops(amount), // Same as "Amount": "22000000"
            "Destination": toAddress,
            "LastLedgerSequence": lastLedgerSequence,
            "SourceTag": parseInt(tag)
        };

        const instructions = {
            "fee": fee,
        };

        //准备transcation
        const preparedTx = await api.prepareTransaction(transaction, instructions);
        //最大总账版本号
        const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion;
        const txJson = preparedTx.txJSON;
        const keypair = { privateKey: priKey, publicKey: pubKey };
        //获取签名
        const response = api.sign(txJson, keypair);
        //最后交易的签名
        const txBlob = response.signedTransaction;
        //交易id
        const txID = response.id;

        //提交的结果
        try {
            const result = await api.submit(txBlob);
            return resultConfig(true, txID, "");
        } catch (err) {
            console.log(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    function getMaxLedgerVersion() {
        return api.getLedger().then(ledger => {
            console.log("ledger.ledgerVersion ", ledger.ledgerVersion);
            return ledger.ledgerVersion + 4;
        }).catch(err => console.error(err));
    }

    /**
     *  获取交易记录
     *
     * @param {*} requestAddress
     * @param {number} [limit=10]
     * @param {*} maxLedgerVersion
     * @returns
     */
    this.getTrans = async function getTrans(requestAddress, limit = 10, maxLedgerVersion) {
        try {
            await api.connect();
            let option = { "limit": limit };
            if (maxLedgerVersion > 0) {
                option["maxLedgerVersion"] = maxLedgerVersion - 1;
            }
            const result = await api.getTransactions(requestAddress, option);
            console.log("交易历史 " + JSON.stringify(result));
            return resultConfig(true, result, "");
        } catch (err) {
            console.log(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    //获取单个交易记录
    this.getSepecificTransaction = async function getSepecificTransaction(txID) {
        await api.connect();
        //最后的总账版本号
        const latestLedgerVersion = await api.getLedgerVersion();
        const earliestLedgerVersion = latestLedgerVersion + 1;
        //检查交易事务的状态
        try {
            var tx = await api.getTransaction(txID);

            return resultConfig(true, tx, "");
        } catch (err) {
            console.log(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    //判断地址是否正确
    this.isValidAddress = async function isValidAddress(address) {
        await api.connect();
        try {
            let result = await api.isValidAddress(address);
            console.log("地址验证结果 " + result)
            return resultConfig(true, result, "");
        } catch (err) {
            console.log(err.message);
            return resultConfig(false, "", err.message);
        }
    };

    //根据私钥获取地址
    this.deriveAddress = async function(seed) {
        await api.connect();
        try {
            let keypair = api.deriveKeypair(seed);
            var public_key = keypair.publicKey;
            var private_key = keypair.privateKey;
            console.log(`公钥为： ${public_key},私钥为${private_key}`)
            var address = api.deriveAddress(public_key);
            console.log(`地址为：${address}`);
            const result = { "address": address, "pubkey": public_key, "privkey": private_key }
            return resultConfig(true, result, "");
        } catch (err) {
            console.log(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    //判断私钥是否有效
    this.isValidSecret = async function(secret) {
        await api.connect();
        try {
            let isValid = api.isValidSecret(secret);
            return resultConfig(true, isValid, "");
        } catch (err) {
            console.log(err.message);
            return resultConfig(false, "", err.message);
        }
    }

    this.getScrect = async function(men) {
        await api.connect();
        try {
            api
        } catch (err) {

        }
    }
}