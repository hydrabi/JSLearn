console.log("hello");
let testAddress1 = 'bchtest:qqczttf6zdu33ymqehy27rz4ke0q9w9kkgartd80ly';
let testAddress1Mne = 'wave because fence town word april ramp enable doctor siege good pull';

let testAddress2 = 'bchtest:qzaahxursqzjlw5uvumdpd79t2ne9zskyumeyzd69s';
let testAddress2Mne = 'copy target urge such ice spatial near sheriff cycle dog file twenty';

let testAddress3 = 'bchtest:qrlp37m3ggd3m0ae7927v7puqdyffzc3hyarq35wqw';
let testAddress3Mne = 'swarm cement any bamboo tip source relief match noodle just scorpion hint';
let BITBOX = require('bitbox-sdk').BITBOX;;
let bitbox = new BITBOX({
    restURL: 'https://trest.bitcoin.com/v2/',
});
new BITBOX()
    // var mne = bitbox.Mnemonic.generate();
    // console.log(mne);


//获取余额
var getBalance = async function(address) {
    try {
        let details = await bitbox.Address.details(address)
        return {
            "result": true,
            "object": details
        };
        // console.log("success " + JSON.stringify(details));
    } catch (err) {
        console.error("error " + err);
        return {
            "result": false,
            "err": err
        };
    }
}

//获取未花费的交易输出
var getUnSpent = async function(address) {
    try {
        let utxo = await bitbox.Address.utxo(address);
        return {
            "result": true,
            "object": utxo
        };
    } catch (err) {
        console.error("error " + err);
        return {
            "result": false,
            "err": err
        };
    }
}

//获取未花费的交易输出
var getTransaction = async function(address) {
    try {
        let transaction = await bitbox.Address.transactions(address);
        return {
            "result": true,
            "object": transaction
        };
    } catch (err) {
        console.error("error " + err);
        return {
            "result": false,
            "err": err
        };
    }
}

var getPrivateKey = function(mne) {
    var keyPair = bitbox.Mnemonic.toKeypairs(mne);
    console.log("success 私钥为：" + JSON.stringify(keyPair));
}

// 排序utxo数组
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

function resultConfig(result, object, err) {
    return {
        "result": result,
        "object": object,
        "err": err
    };
}

async function trans(sendAddress, sendMne, sendAmount, toAddress, minerFee) {
    console.log("start trans");

    //未花费账单的余额（应该用未消费账单的每一笔加起来 现在暂时写死）
    // const balanceSatoshis = bitbox.BitcoinCash.toSatoshi(utxoAmount);
    // console.log("未花费金额为:" + balanceSatoshis);
    //矿工费计算 一般为两笔输出 所以 getByteCount 第二个参数为2
    let byteCount = bitbox.BitcoinCash.getByteCount({ P2PKH: 1 }, { P2PKH: 2 });
    console.log("矿工费:" + byteCount);
    //最大矿工费
    let maxByteCount = 384;
    //要发送的金额 转成聪
    const sendAmountSatoshis = bitbox.BitcoinCash.toSatoshi(sendAmount);
    console.log("发送金额为:" + sendAmountSatoshis);
    //找零
    // const changeAmount = balanceSatoshis - byteCount - amountSatoshis;
    // console.log("找零:" + changeAmount);
    //写死测试地址
    const network = 'testnet';


    let utxos;
    try {
        utxos = await bitbox.Address.utxo(sendAddress);
        console.log("success uxto为：" + JSON.stringify(utxos));
    } catch (err) {
        //请求失败
        console.log(err);
        return resultConfig(false, null, err);
    }

    //已经排序的数组
    let sortUTXOList = sortUTXO(utxos["utxos"]);
    if (sortUTXOList.length == 0) {
        return resultConfig(false, null, "无交易记录");
    }
    console.log("已经排序的数组：" + JSON.stringify(sortUTXOList));

    //需要使用的队列
    let unSpentArr = Array();
    //除去utxo每一笔后剩余的值 用以判断utxo总值是否足够转账
    let leftAmount = sendAmountSatoshis + maxByteCount;
    console.log("leftAmount = " + leftAmount);
    //遍历已排序的数组 将遍历到每一笔账单的值加起来 直到超过或者等于要发送的值为止

    for (let i = 0; i < sortUTXOList.length; i++) {
        let utxo = sortUTXOList[i];
        let amount = utxo["satoshis"];
        unSpentArr.push(utxo);
        leftAmount -= amount;
        console.log("当前leftAmount：" + leftAmount);
        if (leftAmount <= 0) {
            break;
        }
    }

    if (leftAmount > 0) {
        return resultConfig(false, null, "余额不足以转账");
    }

    console.log("选择用以转账的账单：" + JSON.stringify(unSpentArr));

    // //写死
    // let vout = 1;
    // //输入
    // let txid = "55039017223da27f37444c2f80187c0a29152c59a3501bf1d3b66cca9ff1ca03";
    // //要发送的金额
    // const amountToSend = 0.0001;
    // //未花费账单金额
    // const utxoAmount = 0.00979132;
    // //发送地址
    // const fromAddress = testAddress2;
    // //发送地址助记词
    // const fromAddressMne = testAddress2Mne;
    // //接收地址
    // const toAddress = testAddress1;





    // // //找零
    // // const change = balanceSatoshis - feeSatoshis - amountSatoshis;

    // let seedBuffer = bitbox.Mnemonic.toSeed(fromAddressMne);
    // // create HDNode from seed buffer
    // let hdnode = bitbox.HDNode.fromSeed(seedBuffer, network);
    // //Next create a BIP44 account. The 2nd argument is the BIP44 HD path.
    // let account = bitbox.HDNode.derivePath(hdnode, "m/44'/145'/0'");
    // // derive the first external change address HDNode which is going to spend utxo
    // let change = bitbox.HDNode.derivePath(account, '0/0');
    // // get the cash address
    // let cashAddress = bitbox.HDNode.toCashAddress(change);
    // console.log("得到的找零地址:" + cashAddress);


    // let transactionBuilder = new bitbox.TransactionBuilder(network);
    // transactionBuilder.addInput(
    //     txid,
    //     vout
    // );

    // transactionBuilder.addOutput(
    //     toAddress,
    //     amountSatoshis
    // );

    // transactionBuilder.addOutput(
    //     fromAddress,
    //     balanceSatoshis - byteCount - amountSatoshis
    // );

    // let keyPair = bitbox.HDNode.toKeyPair(change);
    // let redeemScript;
    // transactionBuilder.sign(
    //     0,
    //     keyPair,
    //     redeemScript,
    //     transactionBuilder.hashTypes.SIGHASH_ALL,
    //     balanceSatoshis
    // );
    // // build tx
    // let tx = transactionBuilder.build();
    // // output rawhex
    // let hex = tx.toHex();
    // console.log("tx hex is " + hex);
    // bitbox.RawTransactions.sendRawTransaction(hex).then(
    //     result => {
    //         console.log("交易结果为：" + result);
    //     },
    //     err => {
    //         console.log(err)
    //     }
    // )
}

//确认能成功地 不能碰
// function trans1() {
//     console.log("start trans");

//     // //接收地址
//     const toAddress = testAddress2;

//     let seedBuffer = bitbox.Mnemonic.toSeed(testAddress1Mne);
//     // create HDNode from seed buffer
//     let hdnode = bitbox.HDNode.fromSeed(seedBuffer, 'testnet');
//     //Next create a BIP44 account. The 2nd argument is the BIP44 HD path.
//     let account = bitbox.HDNode.derivePath(hdnode, "m/44'/145'/0'");
//     // derive the first external change address HDNode which is going to spend utxo
//     let change = bitbox.HDNode.derivePath(account, '0/0');
//     // get the cash address
//     let cashAddress = bitbox.HDNode.toCashAddress(change);
//     console.log("得到的找零地址:" + cashAddress);
//     //未花费账单的余额（应该用未消费账单的每一笔加起来 现在暂时写死）
//     let originalAmount = bitbox.BitcoinCash.toSatoshi(0.1);
//     //写死
//     let vout = 1;
//     //输入
//     let txid = "2a24ee9ec535e1fe5ca780fb736d99a8758c598b22184c7a921efd0b9828bfd1";
//     let transactionBuilder = new bitbox.TransactionBuilder('testnet');
//     transactionBuilder.addInput(txid, vout);
//     // get byte count to calculate fee. paying 1 sat/byte 192
//     let byteCount = bitbox.BitcoinCash.getByteCount({ P2PKH: 1 }, { P2PKH: 1 });
//     // 发送的金额
//     let sendAmount = originalAmount - byteCount;
//     transactionBuilder.addOutput(
//         toAddress,
//         sendAmount
//     );
//     let keyPair = bitbox.HDNode.toKeyPair(change);
//     let redeemScript;
//     transactionBuilder.sign(
//         0,
//         keyPair,
//         redeemScript,
//         transactionBuilder.hashTypes.SIGHASH_ALL,
//         originalAmount
//     );
//     // build tx
//     let tx = transactionBuilder.build();
//     // output rawhex
//     let hex = tx.toHex();
//     console.log("tx hex is " + hex);
//     bitbox.RawTransactions.sendRawTransaction(hex).then(
//         result => {
//             console.log("交易结果为：" + result);
//         },
//         err => {
//             console.log(err)
//         }
//     )
// }

////////////////////////////测试

// getBalance(testAddress2).then(object => {
//     var result = object["result"]
//     if (result) {
//         console.log("success 余额为：" + JSON.stringify(object["object"]));
//     }
// });

// getUnSpent(testAddress2).then(object => {
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

trans(testAddress2, testAddress2Mne, 0.0001, testAddress1, 0).then({

});