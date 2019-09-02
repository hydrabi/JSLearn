//

//创建钱包生成器
var WalletCreateManager = function() {
    //助记词数量
    var numWords = 12
    var self = this;
    //以英文生成助记词
    var mnemonic = new Mnemonic("english");

    var entropyHex;
    //种子
    var seed = null;
    var network = bitcoinjs.bitcoin.networks.bitcoin;
    var bip32RootKey = null;
    var bip32ExtendedKey = null;
    var generationProcesses = [];
    var coinType = "BTC - Bitcoin";

    function init() {

    }

    //生成随机的助记词
    this.generate = function generateRadomPhrase() {
        var strength = numWords / 3 * 32;
        //Uint8Array 数组类型表示一个8位无符号整型数组，创建时内容被初始化为0。创建完后，可以以对象的方式或使用数组下标索引的方式引用数组中的元素。
        var buffer = new Uint8Array(strength / 8);
        // 创建熵
        var data = crypto.getRandomValues(buffer);
        // 创建助记词
        var words = mnemonic.toMnemonic(data);

        entropyHex = uint8ArrayToHex(data);

        console.log("助记词：" + words);
        console.log("熵十六进制" + entropyHex);

        return words;
    }

    //生成地址
    this.address = function generateAddress(word, pass, coinType) {
        phraseChanged(word, pass, coinType);
    }

    /**
     *
     *
     * @param {*} word 助记词
     * @param {*} pass 密码
     * @param {*} type 币种
     */
    function phraseChanged(word, pass, type) {
        // if (coinType != null) {
        //     network = networks[coinType];
        // }
        coinType = type
        network = bitcoinjs.bitcoin.networks.bitcoin;
        calcBip32RootKeyFromSeed(word, pass);
        calcForDerivationPath();
        displayBip32Info();
    }

    function calcForDerivationPath() {

        var derivationPath = getDerivationPath();
        var errorText = findDerivationPathErrors(derivationPath);
        if (errorText) {
            return;
        }
        bip32ExtendedKey = calcBip32ExtendedKey(derivationPath);
    }

    function calcBip32RootKeyFromSeed(phrase, passphrase) {
        seed = mnemonic.toSeed(phrase, passphrase);
        bip32RootKey = bitcoinjs.bitcoin.HDNode.fromSeedHex(seed, network);
        console.log(bip32RootKey);
    }


    function parseIntNoNaN(val, defaultVal) {
        var v = parseInt(val);
        if (isNaN(v)) {
            return defaultVal;
        }
        return v;
    }

    function displayBip32Info() {
        // Display the key

        var rootKey = bip32RootKey.toBase58();
        var xprvkeyB58 = "NA";
        if (!bip32ExtendedKey.isNeutered()) {
            xprvkeyB58 = bip32ExtendedKey.toBase58();
        }
        var extendedPrivKey = xprvkeyB58;
        var extendedPubKey = bip32ExtendedKey.neutered().toBase58();

        var row = new TableRow(0)
    }

    function calcBip32ExtendedKey(path) {
        // Check there's a root key to derive from
        if (!bip32RootKey) {
            return bip32RootKey;
        }
        var extendedKey = bip32RootKey;
        // Derive the key from the path
        var pathBits = path.split("/");
        for (var i = 0; i < pathBits.length; i++) {
            var bit = pathBits[i];
            var index = parseInt(bit);
            if (isNaN(index)) {
                continue;
            }
            var hardened = bit[bit.length - 1] == "'";
            var isPriv = !(extendedKey.isNeutered());
            var invalidDerivationPath = hardened && !isPriv;
            if (invalidDerivationPath) {
                extendedKey = null;
            } else if (hardened) {
                extendedKey = extendedKey.deriveHardened(index);
            } else {
                extendedKey = extendedKey.derive(index);
            }
        }
        return extendedKey
    }

    function getDerivationPath() {

        var purpose = parseIntNoNaN("", 44);
        var coin = parseIntNoNaN("", 0);
        var account = parseIntNoNaN("", 0);
        var change = parseIntNoNaN("", 0);
        var path = "m/";
        path += purpose + "'/";
        path += coin + "'/";
        path += account + "'/";
        path += change;

        var derivationPath = path;
        console.log("Using derivation path from BIP44 tab: " + derivationPath);
        return derivationPath;

    }

    function TableRow(index) {

        var self = this;
        this.shouldGenerate = true;
        // var useHardenedAddresses = DOM.hardenedAddresses.prop("checked");
        // var useBip38 = DOM.useBip38.prop("checked");
        // var bip38password = DOM.bip38Password.val();
        // var isSegwit = segwitSelected();
        // var segwitAvailable = networkHasSegwit();
        // var isP2wpkh = p2wpkhSelected();
        // var isP2wpkhInP2sh = p2wpkhInP2shSelected();

        function init() {
            calculateValues();
        }

        function calculateValues() {

            if (!self.shouldGenerate) {
                return;
            }
            // derive HDkey for this row of the table
            var key = "NA";

            key = bip32ExtendedKey.derive(index);

            // bip38 requires uncompressed keys
            // see https://github.com/iancoleman/bip39/issues/140#issuecomment-352164035
            var keyPair = key.keyPair;

            // get address
            var address = keyPair.getAddress().toString();
            // get privkey
            var hasPrivkey = !key.isNeutered();
            var privkey = "NA";
            if (hasPrivkey) {
                privkey = keyPair.toWIF();
            }
            // get pubkey
            var pubkey = keyPair.getPublicKeyBuffer().toString('hex');
            var indexText = getDerivationPath() + "/" + index;

            // Ethereum values are different
            if ((coinType == "ETH - Ethereum") ||
                (coinType == "ETC - Ethereum Classic") ||
                (coinType == "PIRL - Pirl") ||
                (coinType == "MIX - MIX") ||
                (coinType == "MUSIC - Musicoin") ||
                (coinType == "POA - Poa") ||
                (coinType == "EXP - Expanse") ||
                (coinType == "CLO - Callisto") ||
                (coinType == "DXN - DEXON") ||
                (coinType == "ELLA - Ellaism") ||
                (coinType == "ESN - Ethersocial Network") ||
                (coinType == "VET - VeChain")
            ) {
                var privKeyBuffer = keyPair.d.toBuffer(32);
                privkey = privKeyBuffer.toString('hex');
                var addressBuffer = ethUtil.privateToAddress(privKeyBuffer);
                var hexAddress = addressBuffer.toString('hex');
                var checksumAddress = ethUtil.toChecksumAddress(hexAddress);
                address = ethUtil.addHexPrefix(checksumAddress);
                privkey = ethUtil.addHexPrefix(privkey);
                pubkey = ethUtil.addHexPrefix(pubkey);
            }

            // Stellar is different
            if (coinType == "XLM - Stellar") {
                var purpose = parseIntNoNaN(DOM.bip44purpose.val(), 44);
                var coin = parseIntNoNaN(DOM.bip44coin.val(), 0);
                var path = "m/";
                path += purpose + "'/";
                path += coin + "'/" + index + "'";
                var keypair = stellarUtil.getKeypair(path, seed);
                indexText = path;
                privkey = keypair.secret();
                pubkey = address = keypair.publicKey();
            }
            if ((coinType == "NAS - Nebulas")) {
                var NasAccount = require("nebulas-account");
                var privKeyBuffer = keyPair.d.toBuffer(32);
                var nebulasAccount = new NasAccount();
                nebulasAccount.setPrivateKey(privKeyBuffer);
                address = nebulasAccount.getAddressString();
                privkey = nebulasAccount.getPrivateKeyString();
                pubkey = nebulasAccount.getPublicKeyString();
            }
            // Ripple values are different
            if (coinType == "XRP - Ripple") {
                privkey = convertRipplePriv(privkey);
                address = convertRippleAdrr(address);
            }
            // CasinoCoin values are different
            if (coinType == "CSC - CasinoCoin") {
                privkey = convertCasinoCoinPriv(privkey);
                address = convertCasinoCoinAdrr(address);
            }
            // Bitcoin Cash address format may vary
            if (coinType == "BCH - Bitcoin Cash") {
                var bchAddrType = DOM.bitcoinCashAddressType.filter(":checked").val();
                if (bchAddrType == "cashaddr") {
                    address = bchaddr.toCashAddress(address);
                } else if (bchAddrType == "bitpay") {
                    address = bchaddr.toBitpayAddress(address);
                }
            }
            // Bitcoin Cash address format may vary
            if (coinType == "SLP - Simple Ledger Protocol") {
                var bchAddrType = DOM.bitcoinCashAddressType.filter(":checked").val();
                if (bchAddrType == "cashaddr") {
                    address = bchaddr.toSlpAddress(address);
                }
            }


            if ((coinType == "CRW - Crown")) {
                address = bitcoinjs.bitcoin.networks.crown.toNewAddress(address);
            }

            if (coinType == "EOS - EOSIO") {
                address = ""
                pubkey = eosUtil.bufferToPublic(keyPair.getPublicKeyBuffer());
                privkey = eosUtil.bufferToPrivate(keyPair.d.toBuffer(32));
            }

            console.log("地址：" + address + " 公钥：" + pubkey + " 私钥:" + privkey);
            return { "address": address, "pubkey": pubkey, "privkey": privkey }
        }

        init();

    }

    function findDerivationPathErrors(path) {
        // TODO is not perfect but is better than nothing
        // Inspired by
        // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#test-vectors
        // and
        // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#extended-keys
        var maxDepth = 255; // TODO verify this!!
        var maxIndexValue = Math.pow(2, 31); // TODO verify this!!
        if (path[0] != "m") {
            return "First character must be 'm'";
        }
        if (path.length > 1) {
            if (path[1] != "/") {
                return "Separator must be '/'";
            }
            var indexes = path.split("/");
            if (indexes.length > maxDepth) {
                return "Derivation depth is " + indexes.length + ", must be less than " + maxDepth;
            }
            for (var depth = 1; depth < indexes.length; depth++) {
                var index = indexes[depth];
                var invalidChars = index.replace(/^[0-9]+'?$/g, "")
                if (invalidChars.length > 0) {
                    return "Invalid characters " + invalidChars + " found at depth " + depth;
                }
                var indexValue = parseInt(index.replace("'", ""));
                if (isNaN(depth)) {
                    return "Invalid number at depth " + depth;
                }
                if (indexValue > maxIndexValue) {
                    return "Value of " + indexValue + " at depth " + depth + " must be less than " + maxIndexValue;
                }
            }
        }
        // Check root key exists or else derivation path is useless!
        if (!bip32RootKey) {
            return "No root key";
        }
        // Check no hardened derivation path when using xpub keys
        var hardenedPath = path.indexOf("'") > -1;
        // var hardenedAddresses = bip32TabSelected() && DOM.hardenedAddresses.prop("checked");
        var hardened = hardenedPath;
        var isXpubkey = bip32RootKey.isNeutered();
        if (hardened && isXpubkey) {
            return "Hardened derivation path is invalid with xpub key";
        }
        return false;
    }


    function uint8ArrayToHex(a) {
        var s = ""
        for (var i = 0; i < a.length; i++) {
            //十六进制的方式转换为字符串
            var h = a[i].toString(16);
            while (h.length < 2) {
                h = "0" + h;
            }
            s = s + h;
        }
        return s;
    }

    function networkHasSegwit() {
        var n = network;
        if ("baseNetwork" in network) {
            n = bitcoinjs.bitcoin.networks[network.baseNetwork];
        }
        // check if only p2wpkh params are required
        if (p2wpkhSelected()) {
            return "p2wpkh" in n;
        }
        // check if only p2wpkh-in-p2sh params are required
        else if (p2wpkhInP2shSelected()) {
            return "p2wpkhInP2sh" in n;
        }
        // require both if it's unclear which params are required
        return "p2wpkh" in n && "p2wpkhInP2sh" in n;
    }

    var networks = [{
            name: "AC - Asiacoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.asiacoin;
                setHdCoin(51);
            },
        },
        {
            name: "ACC - Adcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.adcoin;
                setHdCoin(161);
            },
        },
        {
            name: "AUR - Auroracoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.auroracoin;
                setHdCoin(85);
            },
        },
        {
            name: "AXE - Axe",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.axe;
                setHdCoin(4242);
            },
        },
        {
            name: "ANON - ANON",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.anon;
                setHdCoin(220);
            },
        },
        {
            name: "BOLI - Bolivarcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bolivarcoin;
                setHdCoin(278);
            },
        },
        {
            name: "BCA - Bitcoin Atom",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.atom;
                setHdCoin(185);
            },
        },
        {
            name: "BCH - Bitcoin Cash",
            onSelect: function() {
                DOM.bitcoinCashAddressTypeContainer.removeClass("hidden");
                setHdCoin(145);
            },
        },
        {
            name: "BEET - Beetlecoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.beetlecoin;
                setHdCoin(800);
            },
        },
        {
            name: "BELA - Belacoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.belacoin;
                setHdCoin(73);
            },
        },
        {
            name: "BLK - BlackCoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.blackcoin;
                setHdCoin(10);
            },
        },
        {
            name: "BND - Blocknode",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.blocknode;
                setHdCoin(2941);
            },
        },
        {
            name: "tBND - Blocknode Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.blocknode_testnet;
                setHdCoin(1);
            },
        },
        {
            name: "BRIT - Britcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.britcoin;
                setHdCoin(70);
            },
        },
        {
            name: "BSD - Bitsend",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitsend;
                setHdCoin(91);
            },
        },
        {
            name: "BST - BlockStamp",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.blockstamp;
                setHdCoin(254);
            },
        },
        {
            name: "BTA - Bata",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bata;
                setHdCoin(89);
            },
        },
        {
            name: "BTC - Bitcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(0);
            },
        },
        {
            name: "BTC - Bitcoin Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.testnet;
                setHdCoin(1);
            },
        },
        {
            name: "BITG - Bitcoin Green",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoingreen;
                setHdCoin(222);
            },
        },
        {
            name: "BTCP - Bitcoin Private",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoinprivate;
                setHdCoin(183);
            },
        },
        {
            name: "BTCZ - Bitcoinz",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoinz;
                setHdCoin(177);
            },
        },
        {
            name: "BTDX - BitCloud",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcloud;
                setHdCoin(218);
            },
        },
        {
            name: "BTG - Bitcoin Gold",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bgold;
                setHdCoin(156);
            },
        },
        {
            name: "BTX - Bitcore",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcore;
                setHdCoin(160);
            },
        },
        {
            name: "CCN - Cannacoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.cannacoin;
                setHdCoin(19);
            },
        },
        {
            name: "CESC - Cryptoescudo",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.cannacoin;
                setHdCoin(111);
            },
        },
        {
            name: "CDN - Canadaecoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.canadaecoin;
                setHdCoin(34);
            },
        },
        {
            name: "CLAM - Clams",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.clam;
                setHdCoin(23);
            },
        },
        {
            name: "CLO - Callisto",
            segwitAvailable: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(820);
            },
        },
        {
            name: "CLUB - Clubcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.clubcoin;
                setHdCoin(79);
            },
        },
        {
            name: "CMP - Compcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.compcoin;
                setHdCoin(71);
            },
        },
        {
            name: "CPU - CPUchain",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.cpuchain;
                setHdCoin(363);
            },
        },
        {
            name: "CRAVE - Crave",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.crave;
                setHdCoin(186);
            },
        },
        {
            name: "CRW - Crown (Legacy)",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.crown;
                setHdCoin(72);
            },
        },
        {
            name: "CRW - Crown",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.crown;
                setHdCoin(72);
            },
        },
        {
            name: "CSC - CasinoCoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(359);
            },
        },
        {
            name: "DASH - Dash",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.dash;
                setHdCoin(5);
            },
        },
        {
            name: "DASH - Dash Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.dashtn;
                setHdCoin(1);
            },
        },
        {
            name: "DFC - Defcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.defcoin;
                setHdCoin(1337);
            },
        },
        {
            name: "DGB - Digibyte",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.digibyte;
                setHdCoin(20);
            },
        },
        {
            name: "DGC - Digitalcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.digitalcoin;
                setHdCoin(18);
            },
        },
        {
            name: "DMD - Diamond",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.diamond;
                setHdCoin(152);
            },
        },
        {
            name: "DNR - Denarius",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.denarius;
                setHdCoin(116);
            },
        },
        {
            name: "DOGE - Dogecoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.dogecoin;
                setHdCoin(3);
            },
        },
        {
            name: "DOGEt - Dogecoin Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.dogecointestnet;
                setHdCoin(1);
            },
        },
        {
            name: "DXN - DEXON",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(237);
            },
        },
        {
            name: "ECN - Ecoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.ecoin;
                setHdCoin(115);
            },
        },
        {
            name: "EDRC - Edrcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.edrcoin;
                setHdCoin(56);
            },
        },
        {
            name: "EFL - Egulden",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.egulden;
                setHdCoin(78);
            },
        },
        {
            name: "ELLA - Ellaism",
            segwitAvailable: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(163);
            },
        },
        {
            name: "EMC2 - Einsteinium",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.einsteinium;
                setHdCoin(41);
            },
        },
        {
            name: "ERC - Europecoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.europecoin;
                setHdCoin(151);
            },
        },
        {
            name: "EOS - EOSIO",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(194);
            },
        },
        {
            name: "ESN - Ethersocial Network",
            segwitAvailable: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(31102);
            },
        },
        {
            name: "ETC - Ethereum Classic",
            segwitAvailable: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(61);
            },
        },
        {
            name: "ETH - Ethereum",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(60);
            },
        },
        {
            name: "EXCL - Exclusivecoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.exclusivecoin;
                setHdCoin(190);
            },
        },
        {
            name: "EXCC - ExchangeCoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.exchangecoin;
                setHdCoin(0);
            },
        },
        {
            name: "EXP - Expanse",
            segwitAvailable: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(40);
            },
        },
        {
            name: "FIX - FIX",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.fix;
                setHdCoin(336);
            },
        },
        {
            name: "FIX - FIX Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.fixtestnet;
                setHdCoin(1);
            },
        },
        {
            name: "FJC - Fujicoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.fujicoin;
                setHdCoin(75);
            },
        },
        {
            name: "FLASH - Flashcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.flashcoin;
                setHdCoin(120);
            },
        },
        {
            name: "FRST - Firstcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.firstcoin;
                setHdCoin(167);
            },
        },
        {
            name: "FTC - Feathercoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.feathercoin;
                setHdCoin(8);
            },
        },
        {
            name: "GAME - GameCredits",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.game;
                setHdCoin(101);
            },
        },
        {
            name: "GBX - Gobyte",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.gobyte;
                setHdCoin(176);
            },
        },
        {
            name: "GCR - GCRCoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.gcr;
                setHdCoin(79);
            },
        },
        {
            name: "GRC - Gridcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.gridcoin;
                setHdCoin(84);
            },
        },
        {
            name: "HNC - Helleniccoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.helleniccoin;
                setHdCoin(168);
            },
        },
        {
            name: "HUSH - Hush",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.hush;
                setHdCoin(197);
            },
        },
        {
            name: "INSN - Insane",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.insane;
                setHdCoin(68);
            },
        },
        {
            name: "IOP - Iop",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.iop;
                setHdCoin(66);
            },
        },
        {
            name: "IXC - Ixcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.ixcoin;
                setHdCoin(86);
            },
        },
        {
            name: "JBS - Jumbucks",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.jumbucks;
                setHdCoin(26);
            },
        },
        {
            name: "KMD - Komodo",
            bip49available: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.komodo;
                setHdCoin(141);
            },
        },
        {
            name: "KOBO - Kobocoin",
            bip49available: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.kobocoin;
                setHdCoin(196);
            },
        },
        {
            name: "LBC - Library Credits",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.lbry;
                setHdCoin(140);
            },
        },
        {
            name: "LCC - Litecoincash",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.litecoincash;
                setHdCoin(192);
            },
        },
        {
            name: "LDCN - Landcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.landcoin;
                setHdCoin(63);
            },
        },
        {
            name: "LINX - Linx",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.linx;
                setHdCoin(114);
            },
        },
        {
            name: "LKR - Lkrcoin",
            segwitAvailable: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.lkrcoin;
                setHdCoin(557);
            },
        },
        {
            name: "LTC - Litecoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.litecoin;
                setHdCoin(2);
                DOM.litecoinLtubContainer.removeClass("hidden");
            },
        },
        {
            name: "LTCt - Litecoin Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.litecointestnet;
                setHdCoin(1);
                DOM.litecoinLtubContainer.removeClass("hidden");
            },
        },
        {
            name: "LTZ - LitecoinZ",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.litecoinz;
                setHdCoin(221);
            },
        },
        {
            name: "LYNX - Lynx",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.lynx;
                setHdCoin(191);
            },
        },
        {
            name: "MAZA - Maza",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.maza;
                setHdCoin(13);
            },
        },
        {
            name: "MEC - Megacoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.megacoin;
                setHdCoin(217);
            },
        },
        {
            name: "MIX - MIX",
            segwitAvailable: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(76);
            },
        },
        {
            name: "MNX - Minexcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.minexcoin;
                setHdCoin(182);
            },
        },
        {
            name: "MONA - Monacoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.monacoin,
                    setHdCoin(22);
            },
        },
        {
            name: "MUSIC - Musicoin",
            segwitAvailable: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(184);
            },
        },
        {
            name: "NAV - Navcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.navcoin;
                setHdCoin(130);
            },
        },
        {
            name: "NAS - Nebulas",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(2718);
            },
        },
        {
            name: "NEBL - Neblio",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.neblio;
                setHdCoin(146);
            },
        },
        {
            name: "NEOS - Neoscoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.neoscoin;
                setHdCoin(25);
            },
        },
        {
            name: "NIX - NIX Platform",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.nix;
                setHdCoin(400);
            },
        },
        {
            name: "NLG - Gulden",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.gulden;
                setHdCoin(87);
            },
        },
        {
            name: "NMC - Namecoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.namecoin;
                setHdCoin(7);
            },
        },
        {
            name: "NRG - Energi",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.energi;
                setHdCoin(204);
            },
        },
        {
            name: "NRO - Neurocoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.neurocoin;
                setHdCoin(110);
            },
        },
        {
            name: "NSR - Nushares",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.nushares;
                setHdCoin(11);
            },
        },
        {
            name: "NYC - Newyorkc",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.newyorkc;
                setHdCoin(179);
            },
        },
        {
            name: "NVC - Novacoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.novacoin;
                setHdCoin(50);
            },
        },
        {
            name: "OK - Okcash",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.okcash;
                setHdCoin(69);
            },
        },
        {
            name: "OMNI - Omnicore",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.omnicore;
                setHdCoin(200);
            },
        },
        {
            name: "ONION - DeepOnion",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.deeponion;
                setHdCoin(305);
            },
        },
        {
            name: "ONX - Onixcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.onixcoin;
                setHdCoin(174);
            },
        },
        {
            name: "PHR - Phore",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.phore;
                setHdCoin(444);
            },
        },
        {
            name: "PINK - Pinkcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.pinkcoin;
                setHdCoin(117);
            },
        },
        {
            name: "PIRL - Pirl",
            segwitAvailable: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(164);
            },
        },
        {
            name: "PIVX - PIVX",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.pivx;
                setHdCoin(119);
            },
        },
        {
            name: "PIVX - PIVX Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.pivxtestnet;
                setHdCoin(1);
            },
        },
        {
            name: "POA - Poa",
            segwitAvailable: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(178);
            },
        },
        {
            name: "POSW - POSWcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.poswcoin;
                setHdCoin(47);
            },
        },
        {
            name: "POT - Potcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.potcoin;
                setHdCoin(81);
            },
        },
        {
            name: "PPC - Peercoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.peercoin;
                setHdCoin(6);
            },
        },
        {
            name: "PRJ - ProjectCoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.projectcoin;
                setHdCoin(533);
            },
        },
        {
            name: "PSB - Pesobit",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.pesobit;
                setHdCoin(62);
            },
        },
        {
            name: "PUT - Putincoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.putincoin;
                setHdCoin(122);
            },
        },
        {
            name: "RVN - Ravencoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.ravencoin;
                setHdCoin(175);
            },
        },
        {
            name: "RBY - Rubycoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.rubycoin;
                setHdCoin(16);
            },
        },
        {
            name: "RDD - Reddcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.reddcoin;
                setHdCoin(4);
            },
        },
        {
            name: "RVR - RevolutionVR",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.revolutionvr;
                setHdCoin(129);
            },
        },
        {
            name: "SAFE - Safecoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.safecoin;
                setHdCoin(19165);
            },
        },
        {
            name: "SLS - Salus",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.salus;
                setHdCoin(63);
            },
        },
        {
            name: "SDC - ShadowCash",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.shadow;
                setHdCoin(35);
            },
        },
        {
            name: "SDC - ShadowCash Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.shadowtn;
                setHdCoin(1);
            },
        },
        {
            name: "SLM - Slimcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.slimcoin;
                setHdCoin(63);
            },
        },
        {
            name: "SLM - Slimcoin Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.slimcointn;
                setHdCoin(111);
            },
        },
        {
            name: "SLP - Simple Ledger Protocol",
            onSelect: function() {
                DOM.bitcoinCashAddressTypeContainer.removeClass("hidden");
                setHdCoin(245);
            },
        },
        {
            name: "SLR - Solarcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.solarcoin;
                setHdCoin(58);
            },
        },
        {
            name: "SMLY - Smileycoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.smileycoin;
                setHdCoin(59);
            },
        },
        {
            name: "STASH - Stash",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.stash;
                setHdCoin(0xC0C0);
            },
        },
        {
            name: "STASH - Stash Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.stashtn;
                setHdCoin(0xCAFE);
            },
        },
        {
            name: "STRAT - Stratis",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.stratis;
                setHdCoin(105);
            },
        },
        {
            name: "TSTRAT - Stratis Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.stratistest;
                setHdCoin(105);
            },
        },
        {
            name: "SYS - Syscoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.syscoin;
                setHdCoin(57);
            },
        },
        {
            name: "THC - Hempcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.hempcoin;
                setHdCoin(113);
            },
        },
        {
            name: "TOA - Toa",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.toa;
                setHdCoin(159);
            },
        },
        {
            name: "TWINS - TWINS",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.twins;
                setHdCoin(970);
            },
        },
        {
            name: "TWINS - TWINS Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.twinstestnet;
                setHdCoin(1);
            },
        },
        {
            name: "USC - Ultimatesecurecash",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.ultimatesecurecash;
                setHdCoin(112);
            },
        },
        {
            name: "USNBT - NuBits",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.nubits;
                setHdCoin(12);
            },
        },
        {
            name: "UNO - Unobtanium",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.unobtanium;
                setHdCoin(92);
            },
        },
        {
            name: "VASH - Vpncoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.vpncoin;
                setHdCoin(33);
            },
        },
        {
            name: "VET - VeChain",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(818);
            },
        },
        {
            name: "VIA - Viacoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.viacoin;
                setHdCoin(14);
            },
        },
        {
            name: "VIA - Viacoin Testnet",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.viacointestnet;
                setHdCoin(1);
            },
        },
        {
            name: "VIVO - Vivo",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.vivo;
                setHdCoin(166);
            },
        },
        {
            name: "VTC - Vertcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.vertcoin;
                setHdCoin(28);
            },
        },
        {
            name: "WGR - Wagerr",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.wagerr;
                setHdCoin(7825266);
            },
        },
        {
            name: "WC - Wincoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.wincoin;
                setHdCoin(181);
            },
        },
        {
            name: "XAX - Artax",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.artax;
                setHdCoin(219);
            },
        },
        {
            name: "XBC - Bitcoinplus",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoinplus;
                setHdCoin(65);
            },
        },
        {
            name: "XLM - Stellar",
            onSelect: function() {
                network = stellarUtil.dummyNetwork;
                setHdCoin(148);
            },
        },
        {
            name: "XMY - Myriadcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.myriadcoin;
                setHdCoin(90);
            },
        },
        {
            name: "XRP - Ripple",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.bitcoin;
                setHdCoin(144);
            },
        },
        {
            name: "XVC - Vcash",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.vcash;
                setHdCoin(127);
            },
        },
        {
            name: "XVG - Verge",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.verge;
                setHdCoin(77);
            },
        },
        {
            name: "XUEZ - Xuez",
            segwitAvailable: false,
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.xuez;
                setHdCoin(225);
            },
        },
        {
            name: "XWC - Whitecoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.whitecoin;
                setHdCoin(155);
            },
        },
        {
            name: "XZC - Zcoin",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.zcoin;
                setHdCoin(136);
            },
        },
        {
            name: "ZCL - Zclassic",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.zclassic;
                setHdCoin(147);
            },
        },
        {
            name: "ZEC - Zcash",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.zcash;
                setHdCoin(133);
            },
        },
        {
            name: "ZEN - Zencash",
            onSelect: function() {
                network = bitcoinjs.bitcoin.networks.zencash;
                setHdCoin(121);
            },
        },
    ]

    var clients = [{
            name: "Bitcoin Core",
            onSelect: function() {
                DOM.bip32path.val("m/0'/0'");
                DOM.hardenedAddresses.prop('checked', true);
            },
        },
        {
            name: "blockchain.info",
            onSelect: function() {
                DOM.bip32path.val("m/44'/0'/0'");
                DOM.hardenedAddresses.prop('checked', false);
            },
        },
        {
            name: "MultiBit HD",
            onSelect: function() {
                DOM.bip32path.val("m/0'/0");
                DOM.hardenedAddresses.prop('checked', false);
            },
        },
        {
            name: "Coinomi, Ledger",
            onSelect: function() {
                DOM.bip32path.val("m/44'/" + DOM.bip44coin.val() + "'/0'");
                DOM.hardenedAddresses.prop('checked', false);
            },
        }
    ]

    init();
}