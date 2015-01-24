var fs = require("fs");
var ajaxRequest = require('request');
var stockUtil = require("./stockutil");
var jsonObjAll = {};
var moneyFlowUrl = "http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/MoneyFlow.ssl_qsfx_zjlrqs?page=1&num=" + 100 + "&sort=opendate&asc=0&daima=";

var stocks = stockUtil.getStockList();
//stocks = ["sh600317"];

update(0);

function update(startIndex) {
    var len = stocks.length;
    if (startIndex >= len) {
        var c = 0;
        for (var att in jsonObjAll) {
            c++;
        }
        console.log("moneyflow history updated", c, len);
        fs.writeFileSync("./datasource/moneyflowhistory.json", JSON.stringify(jsonObjAll));
        return;
    }

    var step = 100;
    console.log("update...", startIndex)

    var counter = 0;
    for (var i = startIndex; i < len && i < startIndex + step; i++) {
        var stockId = stocks[i].toLowerCase();
        (function() {
            var _stockId = stockId;
            ajaxRequest(moneyFlowUrl + _stockId,
                function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        body = body.replace(/\},\{/g, "}-{");
                        body = body.replace(/,/g, ",\"");
                        body = body.replace(/:/g, "\":");
                        body = body.replace(/\{/g, "{\"");
                        body = body.replace(/\}-\{/g, "},{");
                        var json = JSON.parse(body);
                        //json.reverse();
                        //var origjson = readMoneyFlowDateMapSync(_stockId);

                        for (var j = 0; j < json.length; j++) {
                            var fields = json[j].opendate.split("-");
                            var _date = fields[1] + "/" + fields[2] + "/" + fields[0];
                            json[j].date = _date;
                            //console.log(_stockId, j, _date, json[j].opendate, origjsonArr.length)
                        }
                        //
                        jsonObjAll[_stockId] = processMoneyFlowData(_stockId, json);

                        // console.log(_stockId, jsonObjAll[_stockId]);
                        counter++;
                        if (counter === i - startIndex) {
                            update(startIndex + step);
                        }
                    } else {
                        console.log("error", error)
                    }

                });
        })();

    }

}

function processMoneyFlowData(stock, jsonArr) {
    var re = {};
    var max_r0_net = -10000000000, max_r123_net = -10000000000, min_r123_net = 10000000000;
    var max_r0_net_idx = -1, max_r123_net_idx = -1, min_r123_net_idx = -1 ;
    var r0_net_sum = 0, r123_net_sum = 0;

    var len = jsonArr.length;
    for (var i = 0; i < len; i++) {
        var obj = jsonArr[i];
        var r0_net = Number(obj.r0_net);
        r0_net_sum+= r0_net;
        if (r0_net_sum>max_r0_net) {
          max_r0_net = r0_net_sum;
          max_r0_net_idx = i;
        }

        if (i===9) {
          re["max_r0_net_10"] = max_r0_net;
          re["max_r0_net_10_date"] = jsonArr[max_r0_net_idx].date;
        }

        if (i===19) {
          re["max_r0_net_20"] = max_r0_net;
          re["max_r0_net_20_date"] = jsonArr[max_r0_net_idx].date;
        }

        if (i===39) {
          re["max_r0_net_40"] = max_r0_net;
          re["max_r0_net_40_date"] = jsonArr[max_r0_net_idx].date;
        }

        if (i===len-1) {
          re["max_r0_net"] = max_r0_net;
          re["max_r0_net_date"] = jsonArr[max_r0_net_idx].date;
        }

        var netamount = Number(obj.netamount);
        var r123_net = netamount - r0_net;
        r123_net_sum += r123_net;

        if (r123_net_sum<min_r123_net) {
            min_r123_net = r123_net_sum;
            min_r123_net_idx = i;
            //console.log("min_r123_net", i, (min_r123_net/10000).toFixed(0), jsonArr[i].date)
        }


        if (i===9) {
          re["min_r123_net_10"] = min_r123_net;
          re["min_r123_net_10_date"] = jsonArr[min_r123_net_idx].date;
        }

        if (r123_net_sum>max_r123_net) {
          max_r123_net = r123_net_sum;
          max_r123_net_idx = i;
        }

        if (i===9) {
          re["max_r123_net_10"] = max_r123_net;
          if (!jsonArr[max_r123_net_idx]) console.log(stock, r123_net_sum/10000,  max_r123_net_idx, jsonArr.length)
          re["max_r123_net_10_date"] = jsonArr[max_r123_net_idx].date;
        }

        if (i===19) {
          re["max_r123_net_20"] = max_r123_net;
          re["max_r123_net_20_date"] = jsonArr[max_r123_net_idx].date;
        }

        if (i===39) {
          re["max_r123_net_40"] = max_r123_net;
          re["max_r123_net_40_date"] = jsonArr[max_r123_net_idx].date;
        }

        if (i===len-1) {
          re["max_r123_net"] = max_r123_net;
          re["max_r123_net_date"] = jsonArr[max_r123_net_idx].date;
        }

    }
    if (re.min_r123_net_10<-5000000
      && re.max_r123_net_20<20000000
      && re.max_r123_net_20 < 0.2*re.max_r0_net_20
      && re.max_r0_net > 1000000000
      && re.max_r0_net_20 < 2000000000) {
      console.log("==========", stock, re)
    }
    return re;
}

function readMoneyFlowSync(stockId) {
    var moneyFlowJson = [];
    var path = "../datasource/moneyflow/" + stockId + ".json";
    if (fs.existsSync(path)) {
        var content = fs.readFileSync(path, "utf8");
        content.split("\r\n").forEach(function(line) {
            if (line.length > 0) {
                var json = JSON.parse(line);
                if (json.turnover === 0) return;
                // var  str = (json.netamount/10000).toFixed(2);
                // if (str.length<8) {
                //   for (var i=str.length; i<8; i++) {
                //     str+=" ";
                //   }
                // }
                //console.log(json.opendate, " ",str, " ",(json.r0_net/10000).toFixed(2));
                moneyFlowJson.push(json);
            }
        });
    }
    //moneyFlowJson.reverse();
    return moneyFlowJson;
}


function writeMoneyFlowSync(stockId, jsonData) {
    var data = "";
    jsonData.forEach(function(line) {
        for (attr in line) {
            if (attr === "opendate") {
                // var fields = line.opendate.split("-");
                // line.opendate = fields[1]+"/"+fields[2]+"/"+fields[0];
            } else {
                line[attr] = Number(line[attr]);
            }
        }

        if (data !== "") {
            data = data + "\r\n";
        }
        data = data + JSON.stringify(line);
    });

    fs.writeFileSync("../datasource/moneyflow/" + stockId + ".json", data);
}
