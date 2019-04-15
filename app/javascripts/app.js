import "bootstrap/dist/css/bootstrap.css"
import "../stylesheets/app.css";

import {
    default as Web3
} from 'web3';
import {
    default as contract
} from 'truffle-contract'
import ecommerce_store_artifacts from '../../build/contracts/EcommerceStore.json'
import ipfsAPI from 'ipfs-api'
import ethUtil from 'ethereumjs-util'
import $ from 'jquery'

const ethereumNodeUrl = ETHEREUM_NODE_URL ? ETHEREUM_NODE_URL : 'http://localhost:8545'
const ipfsApiAddress = {
    protocol: 'http',
    host: IPFS_API_HOST ? IPFS_API_HOST : 'localhost',
    port: IPFS_API_PORT ? IPFS_API_PORT : 5001
}
const ipfsGatewayUrl = IPFS_GATEWAY_URL ? IPFS_GATEWAY_URL : 'http://localhost:8080'

const EcommerceStore = contract(ecommerce_store_artifacts);
const ipfs = ipfsAPI(ipfsApiAddress);

let reader;
window.App = {
    start: function () {
        EcommerceStore.setProvider(web3.currentProvider);

        if ($("#index-page").length > 0) {
            renderStore()
        }

        if ($('#list-item-page').length > 0) {
            $("#product-image").change(event => {
                if (event.target.files.length === 0) return
                const file = event.target.files[0]
                // FileReader 对象允许Web应用程序异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容，
                // 使用 File 或 Blob 对象指定要读取的文件或数据。
                // 开始读取指定的 Blob中的内容, 一旦完成, result 属性中保存的将是被读取文件的 ArrayBuffer 数据对象.
                reader = new window.FileReader()
                reader.readAsArrayBuffer(file)
            });

            $("#add-item-to-store").submit(event => {
                event.preventDefault();
                const req = $("#add-item-to-store").serialize();
                let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
                let decodedParams = {}
                //  返回对象的可枚举属性和方法的名称。
                Object.keys(params)
                    .forEach(k => decodedParams[k] = decodeURIComponent(decodeURI(params[k])))
                saveProduct(reader, decodedParams);
            })
        }
    }
};

// 添加"load"事件, 窗口加载时, 调用函数
window.addEventListener('load', function () {
    window.web3 = new Web3(new Web3.providers.HttpProvider(ethereumNodeUrl));
    App.start();
});

function renderStore() {
    let inst
    return EcommerceStore.deployed()
        .then(i => inst = i)
        .then(() => inst.productIndex())  // 无需参数, 直接调用函数, 得到返回值, 再进行传递
        .then(next => {
            for (let id = 1; id <= next; id++) {
                inst.getProduct.call(id)
                    // 渲染页面
                    .then(p => $("#product-list").append(buildProduct(p)))
            }
        })
}

function buildProduct(product) {
    // EC6 读取数据, 写入到html中
    let imgUrl = `${ipfsGatewayUrl}/ipfs/${product[3]}`
    let html = `<div>
                <img src="${imgUrl}" width="150px" />
                <div>${product[1]}</div>
                <div>${product[2]}</div>
                <div>${product[5]}</div>
                <div>${product[6]}</div>
                <div>Eether ${product[6]}</div>
              </div>`
    return $(html);
}

/*
Buffer(缓冲区)
    JavaScript 语言自身只有字符串数据类型， 没有二进制数据类型。
    但在处理像TCP流或文件流时， 必须使用到二进制数据

Buffer 实例一般用于表示编码字符的序列， 比如 UTF - 8、 UCS2、 Base64、 或十六进制编码的数据。 
通过使用显式的字符编码， 就可以在 Buffer 实例与普通的 JavaScript 字符串之间进行相互转换。

创建Buffer类
    Buffer.from(array)： 返回一个被 array 的值初始化的新的 Buffer 实例（ 传入的 array 的元素只能是数字， 不然就会自动被 0 覆盖）
    Buffer.from(arrayBuffer[, byteOffset[, length]])： 返回一个新建的与给定的 ArrayBuffer 共享同一内存的 Buffer。
    Buffer.from(buffer)： 复制传入的 Buffer 实例的数据， 并返回一个新的 Buffer 实例
    Buffer.from(string[, encoding])： 返回一个被 string 的值初始化的新的 Buffer 实例

写入
    buf.write(string[, offset[, length]][, encoding])
读取
    buf.toString([encoding[, start[, end]]]) / buf.toJSON()
合并
    Buffer.concat(list[, totalLength])
比较
    buf.compare(otherBuffer);
*/
function saveImageOnIpfs(reader) {
    const buffer = Buffer.from(reader.result);
    return ipfs.add(buffer)
        .then(rsp => rsp[0].hash)
        .catch(err => console.error(err))
}

function saveTextBlobOnIpfs(blob) {
    const descBuffer = Buffer.from(blob, 'utf-8');
    return ipfs.add(descBuffer)
        .then(rsp => rsp[0].hash)
        .catch(err => console.error(err))
}

// Date.parse()函数用于分析一个包含日期的字符串，并返回该日期与 1970 年 1 月 1 日午夜之间相差的毫秒数。
/*
处理整数的时候parseInt() 更常用。 parseInt() 函数在转换字符串时， 会忽略字符串前面的空格， 知道找到第一个非空格字符。
如果第一个字符不是数字或者负号， parseInt() 就会返回NaN， 同样的， 用parseInt() 转换空字符串也会返回NaN。
如果第一个字符是数字字符， parseInt() 会继续解析第二个字符， 直到解析完所有后续字符串或者遇到了一个非数字字符。
*/
function saveProductToBlockchain(params, imageId, descId) {
    let auctionStartTime = Date.parse(params["product-auction-start"]) / 1000;
    let auctionEndTime = auctionStartTime + parseInt(params["product-auction-end"]) * 24 * 60 * 60
    return EcommerceStore.deployed()
        .then(inst => inst.addProductToStore(params["product-name"],
            params["product-category"],
            imageId, descId, auctionStartTime, auctionEndTime,
            web3.toWei(params["product-price"], 'ether'),
            parseInt(params["product-condition"]), {
                from: web3.eth.accounts[0],
                gas: 440000
            }))
        .then(() => {
            $("#msg").show();
            $("#msg").html("Your product was successfully added to your store!");
        })
        .catch(err => console.log(err))
}

function saveProduct(reader, decodedParams) {
    let imageId, descId;
    return saveImageOnIpfs(reader)
        .then(id => imageId = id)
        .then(() => saveTextBlobOnIpfs(decodedParams["product-description"]))
        .then(id => descId = id)
        .then(() => saveProductToBlockchain(decodedParams, imageId, descId))
        .catch(err => console.log(err))
}