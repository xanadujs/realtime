var ajaxRequest = require('request');
var fs = require("fs");

stockInfo = {};
var stockList = readStockNames();
readStockPE();
loadStockInfoAjax();

function getStockInfo(symbol){
    // console.log("getStockInfo", symbol, stockInfo[symbol])
    return stockInfo[symbol];
}

function readStockPE(){
    var content = fs.readFileSync("datasource/pe.json", "utf8").toLowerCase();
    var peobj = JSON.parse(content);
    for (var att in peobj) {
        if (stockInfo[att])
            stockInfo[att].pe = peobj[att];
        else console.log("pe:", att);
    }
}

function readStockNames(){
    var content = fs.readFileSync("datasource/stockNames.txt", "utf8");
    var lines = content.split("\r\n");
    var att = [];
    for (var j = 0; j < lines.length; j++) {
        if (lines[j].length===0) continue;
         // console.log(" mfArr[j]", j, lines[j])
        var symbol = lines[j].match("hq_str_([^_]+)=")[1];
        var dataarr = lines[j].match('="([^"]+)";')[1].split(',');
        att.push(symbol);
        // console.log(symbol) 
        stockInfo[symbol] = {"name": dataarr[0]} ;
    }

    return att;
}

function loadStockInfoAjax() {
    var mfurl = "http://hq.sinajs.cn/list=#"
    var step = 500;
    var stockStr = "";
    var requestCount = 0;
    console.log("loadStockInfo...")
    for (var i = 0; i < stockList.length; i++) {
        stockStr += stockList[i].toLowerCase() + ",";
        if ((i % step === 0 && i != 0) || i === stockList.length - 1) {
            var url = mfurl.replace("#", stockStr);
            stockStr = "";
            requestCount++;

            var options = {
                url: url,
                headers: {
                    'accept-language': 'en-US,en;q=0.5'
                }
            };

            ajaxRequest(options, function(error, response, body) {
                requestCount--;
                if (!error && response.statusCode == 200) {
                    var mfArr = body.split("\n");
                    // console.log("mfArr", mfArr.length)
                    for (var j = 0; j < mfArr.length; j++) {
                        if (mfArr[j].length===0) continue;
                         // console.log(" mfArr[j]", j, mfArr[j])
                        var symbol = mfArr[j].match("hq_str_([^_]+)=")[1];
                        var dataarr = mfArr[j].match('="([^"]+)";')[1].split(',');
                        stockInfo[symbol].lastClose =  dataarr[2];

                    }

                } else {
                    console.log("ERROR:", error)
                }
                if (requestCount === 0) {
                    console.log("stockInfo loaded.")
                    // fs.writeFile("datasource/stockInfo.json", JSON.stringify(stockInfo), {encoding: "UTF-8"});
                }
            });
        }
    }

}

function getStockList(){
    return stockList;
}

exports.getStockList = getStockList;
exports.getStockInfo = getStockInfo;
