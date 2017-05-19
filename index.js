/**
 * Created by kevrat on 10.03.2017.
 */
function start(array) {
    document.getElementById('resultSize').innerHTML = ''
    document.getElementById('resultSize').innerHTML += '<br>Начальный размер:' + array.length / 1024 + 'Кб';

    let huffman = new Huffman();

    if (huffman.charNumberLength = document.querySelector('input[name="num"]:checked').value === 'auto') {
        huffman.charNumberLengthAuto = true;
    }
    else {
        huffman.charNumberLength = document.querySelector('input[name="num"]:checked').value;
    }
    let time = performance.now();
    coddedArray = huffman.coding(array.slice());
    time = performance.now() - time;

    var a = document.createElement("a"),
        file = new Blob([coddedArray]);

    document.getElementById('table').innerHTML = '';
    document.getElementById('table').innerHTML += '<br>Таблица кодов';
    for (let {symbol, code} of huffman._codeTable) {
        document.getElementById('table').innerHTML += '<br>' + symbol + ':' + code;
    }
    document.getElementById('resultSize').innerHTML += '<br>Итоговый размер:' + coddedArray.length / 1024 + 'Кб';
    document.getElementById('time').innerHTML = '<br>Время кодирования: ' + time/1000 + 'С';
    const path = document.getElementById("inputFile").value;
    const fileName = path.match(/[^\/\\]+$/) + '.hfmn';
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, fileName);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        if (confirm("Скачать файл?")) {
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    if (coddedArray.length / 1024 >= 1) {
        alert('Дополнительная информация показывается только для файлов, размер которых после сжатия < 1Кб');
    }

    if (coddedArray.length / 1024 < 1 && confirm("Показать дополнительную информацию?")) {

        let textArea = document.getElementById('bytes');
        textArea.value = '';
        textArea.value += array;
        textArea = document.getElementById('bites');
        textArea.value = '';

        function byteToBitString(byte) {
            if (typeof(byte) === 'number') {
                return byte.toString(2);
            }
            return byte.charCodeAt(0).toString(2);
        }

        for (let byte of array) {
            textArea.value += '|' + new Array(8 - byteToBitString(byte).length + 1).join('0')
                + byteToBitString(byte);
        }

        textArea = document.getElementById('result');

        for (let byte of coddedArray) {
            textArea.value += '|' + new Array(8 - byteToBitString(byte).length + 1).join('0')
                + byteToBitString(byte);
        }

    }

}
document.getElementById('inputFile').addEventListener('change', function () {
    let reader = new FileReader();
    reader.onload = function () {
        let arrayBuffer = this.result,
            array = new Uint8Array(arrayBuffer);
        start(array);

    };
    reader.readAsArrayBuffer(this.files[0]);

}, false);

function spliceSlice(str, index, count, add) {
    // We cannot pass negative indexes dirrectly to the 2nd slicing operation.
    if (index < 0) {
        index = str.length + index;
        if (index < 0) {
            index = 0;
        }
    }

    return str.slice(0, index) + (add || "") + str.slice(index + count);
}

document.getElementById("btnStart").onclick = () => start(document.getElementById("inputString").value);