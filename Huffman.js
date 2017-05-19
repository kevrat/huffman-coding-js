/**
 * Created by kevrat on 10.03.2017.
 */
class Huffman {
    constructor() {
        this._charNumberLength = 8;
        this._charNumberLengthAuto = false;
    }

    get charNumberLength() {
        return this._charNumberLength;
    }

    set charNumberLength(value) {
        this._charNumberLength = value;
    }

    get charNumberLengthAuto() {
        return this._charNumberLengthAuto;
    }

    set charNumberLengthAuto(value) {
        this._charNumberLengthAuto = value;
    }

    coding(array) {
        let tree = [];

        //Init branches of tree
        for (let byte of array) {
            let exist = false;
            for (let node of tree) {
                if (node.symbol === '' + byte) {
                    node.frequency++;
                    exist = true;
                }
            }
            if (!exist) {
                tree.push({symbol: '' + byte, frequency: 1})
            }
        }

        //Create tree
        while (tree.length > 1) {
            let minNode1 = Huffman.getNodeWithMinFrequency(tree);
            let minNode2 = Huffman.getNodeWithMinFrequency(tree);
            tree.push({
                symbol: null,
                frequency: minNode1.frequency + minNode2.frequency,
                left: minNode1,
                right: minNode2
            })
        }

        let codeTable = [];//table of codes

        //Filling table using tree
        function preOrderTravers(root, code = '') {
            if (root.left && root.right) {

                code += '0';
                preOrderTravers(root.left, code);
                code = code.slice(1);

                code += '1';
                preOrderTravers(root.right, code);
                code = code.slice(1);

            }
            else {
                codeTable.push({
                    symbol: root.symbol,
                    code: code.slice(),
                    frequency: root.frequency
                })
            }
        }

        preOrderTravers(tree[0]);

        this._codeTable = codeTable;

        if (codeTable.length === 1) {
            codeTable[0].code = '0'
        }

        let bitArray = '';

        function getAutoCharNumberLength(codeTable) {
            let max = 1;
            for (let code of codeTable) {
                max = code.frequency > max ? code.frequency : max;
            }

            let sizes = [8, 16, 32, 64];
            for (let size of sizes) {
                if (max < 2 ^ size) return size
            }
            return 64
        }

        //Write table
        bitArray = Huffman.writeTableToBitArray(bitArray, codeTable, this._charNumberLengthAuto ? getAutoCharNumberLength(codeTable) : this._charNumberLength);

        //Write code
        bitArray = Huffman.writeCompressDataToArray(bitArray, array, codeTable);

        //Get length of last byte
        let lastByte = bitArray.length % 8;

        lastByte = Huffman.fillUntil(lastByte.toString(2), 8);

        //Fill last byte with 0
        let tailLength = 8 - bitArray.length % 8;
        for (let i = 0; i < tailLength; i++) {
            bitArray += 0;
        }

        //Write length of last byt in end
        bitArray += lastByte;

        return Huffman.bitStringToUint8Array(bitArray);
    }

    static writeTableToBitArray(bitArray, codeTable, charNumberLength = 8) {
        //Write symbols size [1 byte]
        const charactersLength = codeTable.length;
        bitArray += Huffman.fillUntil(charactersLength.toString(2), 8);
        //ПWrite in file for all symbols: symbol and him num of repeats
        for (let code of codeTable) {
            bitArray += Huffman.fillUntil(parseInt(code.symbol.charCodeAt(), 10).toString(2), 8);
            bitArray += Huffman.fillUntil(code.frequency.toString(2), charNumberLength);
        }
        return bitArray;
    }

    static writeCompressDataToArray(bitArray, array, codeTable) {
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < codeTable.length; j++) {
                if (codeTable[j].symbol === '' + array[i]) {
                    bitArray += codeTable[j].code;
                    break;
                }

            }
        }
        return bitArray;
    }

    static getNodeWithMinFrequency(tree) {
        let minNode = tree[0];
        for (let node of tree) {
            if (node.frequency < minNode.frequency) {
                minNode = node;
            }
        }
        return tree.splice(tree.indexOf(minNode), 1)[0];
    }

    static fillUntil(str, n) {
        while (str.length < n) {
            str = '0' + str;
        }
        return str
    }

    static bitStringToUint8Array(str) {
        let buf = new ArrayBuffer(str.length / 8);
        let byteBuf = [];
        for (let i = 0; i < str.length; i += 8) {
            byteBuf.push(parseInt(str.substr(i, 8), 2));
        }
        let bufView = new Uint8Array(byteBuf.length);
        for (let i = 0; i < byteBuf.length; i++) {
            bufView[i] = byteBuf[i];
        }
        return bufView;
    }

    //|Num of symbols in table [1 byte]|[Symbol [1 byte] + him repeats [1,2,4,8 bytes]]*n|Code[...]|Length of last byte [1 byte]|
}