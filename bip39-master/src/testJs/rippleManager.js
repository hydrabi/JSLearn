var rippleManager = function() {

    console.log(ripple);
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

    // 获取用户信息
    this.getAccountInfo = async function accountInfo(address) {
        await api.connect();

        const info = await api.getAccountInfo(address);
        console.log(address + "的信息是 " + JSON.stringify(info));
    }

    //获取最低矿工费用
    this.getFee = async function getFee() {
        await api.connect();

        const fee = await api.getFee();
        console.log("费用是 " + fee);
    }

    //转账
    this.requestTransaction = async function requestTransaction(fromAddress, toAddress, fee, amount) {

        await api.connect();
        const ledger = await api.getLedger();
        //最后总账序列 是所有交易的可选参数。这指示Radar网络，截至具体总账实例，交易必须被验证。交易将永远不会被纳入一个有更大序列号的总账实例。
        const lastLedgerSequence = ledger.ledgerVersion + 4;

        const transaction = {
            "TransactionType": "Payment",
            "Account": fromAddress,
            "Amount": api.xrpToDrops(amount), // Same as "Amount": "22000000"
            "Destination": toAddress,
            "LastLedgerSequence": lastLedgerSequence
        };

        const instructions = {
            "fee": fee
        };

        //准备transcation
        const preparedTx = await api.prepareTransaction(transaction, instructions);
        //最大总账版本号
        const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
        const txJson = preparedTx.txJSON;
        //获取签名
        const response = api.sign(txJson, address1Secret);
        //最后交易的签名
        const txBlob = response.signedTransaction;
        //交易id
        const txID = response.id;
        //最后的总账版本号
        const latestLedgerVersion = await api.getLedgerVersion();
        //提交的结果
        const result = await api.submit(txBlob);
        const earliestLedgerVersion = latestLedgerVersion + 1;

        //确认最新的有效版本号
        // api.on('ledger', ledger => {
        //     console.log("Ledger version", ledger.ledgerVersion, "was just validated.");
        //     if (ledger.ledgerVersion > maxLedgerVersion) {
        //         console.log("If the transaction hasn't succeeded by now, it's expired");
        //     }
        // });

        //检查交易事务的状态
        try {
            var tx = await api.getTransaction(txID, {
                minLedgerVersion: earliestLedgerVersion
            });
            console.log("Transaction result:", tx.outcome.result);
            console.log("Balance changes:", JSON.stringify(tx.outcome.balanceChanges));
        } catch (error) {
            console.log("Couldn't get transaction outcome:", error);
        }

        console.log("Prepared transaction instructions:", preparedTx.txJSON);
        console.log("Transaction cost:", preparedTx.instructions.fee, "XRP");
        console.log("Transaction expires after ledger:", preparedTx.instructions.maxLedgerVersion);
        console.log("Identifying hash:", response.id);
        console.log("Signed blob:", txBlob);
        console.log("Tentative result code:", result.resultCode);
        console.log("Tentative result message:", result.resultMessage);

    }


    function getMaxLedgerVersion() {
        return api.getLedger().then(ledger => {
            console.log("ledger.ledgerVersion ", ledger.ledgerVersion);
            return ledger.ledgerVersion + 4;
        }).catch(err => console.error(err));
    }

}