var fs = require("fs");
var ajaxRequest = require('request');
var stockUtil = require("./stockutil");


var stocks = stockUtil.getStockList();

var strongInStackRealTime = [],
    strongOutStackRealTime = [],
    strongInStack = [],
    strongOutStack = [];
var tempMoneyFlowObj;
var last1MoneyFlowObj;
var last2MoneyFlowObj;

var minInRatioRealTime = 0.0001;
var minOutRatioRealTime = 0.0001;
var minInAmountRealTime = 5000000;
var minOutAmountRealTime = 5000000;

var minInRatio = 0.002;
var minInAmount = 100000000;
var minPriceInc = 0.01;

var intervalObject;
function startWatching(interval) {
    update();
    intervalObject = setInterval(update, interval);
}

function stopWatching(){
    clearInterval(intervalObject);
}

function getFavourateItems (stocks) {
    var arr = stocks.split(",");
    var reArr = [];
    for (var i=0; tempMoneyFlowObj && i<arr.length; i++) {
        var obj = tempMoneyFlowObj[arr[i]];
        if (obj) reArr.push(obj);
    }
    return reArr;
}

function getStroingInItems (time, max) {
    var reArr = [];
    for (var i=strongInStack.length-1; i>=0; i--) {
        var obj = strongInStack[i];
        if (obj.servertime > time) {
            reArr.push(obj);
        } else {
            break;
        }
        if (reArr.length === max) break;
    }
    console.log("getStroingInItems", time, reArr.length, strongInStack.length);
    // reArr = [{flow:"out",r0_in:"2140462617.8600",r0_out:"2012582040.5900",r0:"4353489078.9400",r1_in:"305080066.4400",r1_out:"275812292.0400",r1:"602039435.2000",r2_in:"14654745.1600",r2_out:"17100757.0800",r2:"33308913.1200",r3_in:"518161.2800",r3_out:"453019.8400",r3:"1088010.2400",curr_capital:"2721952",name:"ÃñÉúÒøÐÐ",trade:"10.2000",changeratio:"-0.0294957",volume:"485168416.0000",turnover:"178.243",r0x_ratio:"139.016",opendate:"2015-01-08",ticktime:"15:00:05",netamount:"154767481.1900",symbol:"sh600016",chinese:"中文"},{r0_in:"21446885.8400",r0_out:"40065574.5000",r0:"61512460.3400",r1_in:"60921433.0900",r1_out:"88734295.7000",r1:"151300586.7900",r2_in:"32137292.4000",r2_out:"37833603.8000",r2:"71609582.2000",r3_in:"10145487.3200",r3_out:"10372440.9200",r3:"20943229.2400",curr_capital:"130552",name:"ÌúÁúÎïÁ÷",trade:"9.0100",changeratio:"-0.0290948",volume:"33457904.0000",turnover:"256.28",r0x_ratio:"-115.508",opendate:"2015-01-08",ticktime:"15:00:00",netamount:"-52354816.2700",symbol:"sh600125", flow:"in",chinese:"中文"}]
    return reArr;
}

function getActiveItems (flow, time, max) {
    var strongStack = (flow==="in") ? strongInStackRealTime : strongOutStackRealTime;
    var reArr = [];
    // for (var i=0; i<max && i<strongStack.length; i++) {
    for (var i=strongStack.length-1; i>=0; i--) {
        var obj = strongStack[i];
        if (obj.servertime > time) {
            reArr.push(obj);
        } else {
            break;
        }
        if (reArr.length === max) break;
    }
    
    // if (strongStack.length>0)
    //     console.log("--------", strongStack[strongStack.length-1].datetime, time, strongStack[strongStack.length-1].datetime>time)
    
    console.log("getActiveItems", flow, reArr.length, strongInStackRealTime.length, strongOutStackRealTime.length);
    // reArr = [{flow:"out",r0_in:"2140462617.8600",r0_out:"2012582040.5900",r0:"4353489078.9400",r1_in:"305080066.4400",r1_out:"275812292.0400",r1:"602039435.2000",r2_in:"14654745.1600",r2_out:"17100757.0800",r2:"33308913.1200",r3_in:"518161.2800",r3_out:"453019.8400",r3:"1088010.2400",curr_capital:"2721952",name:"ÃñÉúÒøÐÐ",trade:"10.2000",changeratio:"-0.0294957",volume:"485168416.0000",turnover:"178.243",r0x_ratio:"139.016",opendate:"2015-01-08",ticktime:"15:00:05",netamount:"154767481.1900",symbol:"sh600016",chinese:"中文"},{r0_in:"21446885.8400",r0_out:"40065574.5000",r0:"61512460.3400",r1_in:"60921433.0900",r1_out:"88734295.7000",r1:"151300586.7900",r2_in:"32137292.4000",r2_out:"37833603.8000",r2:"71609582.2000",r3_in:"10145487.3200",r3_out:"10372440.9200",r3:"20943229.2400",curr_capital:"130552",name:"ÌúÁúÎïÁ÷",trade:"9.0100",changeratio:"-0.0290948",volume:"33457904.0000",turnover:"256.28",r0x_ratio:"-115.508",opendate:"2015-01-08",ticktime:"15:00:00",netamount:"-52354816.2700",symbol:"sh600125", flow:"in",chinese:"中文"}]
    return reArr;
}

function update() {
    var mfurl = "http://vip.stock.finance.sina.com.cn/quotes_service/api/jsonp.php/var%20moneyFlowData=/MoneyFlow.ssi_ssfx_flzjtj?daima=#&gettime=1"
    var step = 500;
    var stockStr = "";
    var requestCount = 0;
    _tempMoneyFlowObj = {};

    for (var i = 0; i < stocks.length; i++) {
        stockStr += stocks[i] + ",";
        if ((i % step === 0 && i != 0) || i === stocks.length - 1) {
            var url = mfurl.replace("#", stockStr);
            stockStr = "";
            requestCount++;

            var options = {
                url: url,
                headers: {
                    'accept-language': 'en-US,en;q=0.5',
                    'Accept-Charset': 'UTF-8'
                }
            };
            ajaxRequest(options, function(error, response, body) {
                requestCount--;
                if (!error && response.statusCode == 200) {
                    mfArr = body.match(/(\{[^\{\}]+\})/g);
                    for (var j = 0; j < mfArr.length; j++) {
                        // console.log(mfArr[j].replace(/:"/g, '":"').replace(/,/g, ',"').replace("{", "{\""))
                        var mfobj = JSON.parse(mfArr[j].replace(/:"/g, '":"').replace(/,/g, ',"').replace("{", "{\""));
                        (function(obj){
                            for (var att in obj) {
                                if (att != "opendate" && att != "ticktime" && att != "name" && att != "symbol") {
                                    obj[att] = Number(obj[att]);
                                }
                            }
                        })(mfobj);
                        mfobj.datetime = new Date(mfobj.opendate+" " +mfobj.ticktime).getTime();
                        mfobj['name'] = stockUtil.getStockInfo(mfobj.symbol).name;
                        mfobj.servertime = new Date().getTime();
                        var lastClose = stockUtil.getStockInfo(mfobj.symbol).lastClose;
                        var price_inc = (mfobj.trade-lastClose)/lastClose;
                        mfobj['price_inc'] = price_inc;

                        _tempMoneyFlowObj[mfobj.symbol] = mfobj;
                    }

                } else {
                    console.log("ERROR:", error)
                }
                if (requestCount === 0) {
                    tempMoneyFlowObj = _tempMoneyFlowObj;
                    updateStacks();
                }
            });
        }
    }

}

function updateStacks() {
    
    var switchFlag = false;
    if (!last1MoneyFlowObj) {
        last1MoneyFlowObj = tempMoneyFlowObj;
        // return;
        switchFlag = true;
    }

    if (!last2MoneyFlowObj) {
        last2MoneyFlowObj = last1MoneyFlowObj;
        last1MoneyFlowObj = tempMoneyFlowObj;
        // return;
        switchFlag = true;
    }
    // console.log("updateStacks", last1MoneyFlowObj, last2MoneyFlowObj, tempMoneyFlowObj);
    strongInStack = [];
    var incount = 0, outcount = 0;
    var inTempArr = [], outTempArr = [];
    for (var stock in tempMoneyFlowObj) {
        if (!tempMoneyFlowObj[stock]) console.log("ERROR tempMoneyFlowObj", stock );

        var inamount = tempMoneyFlowObj[stock].r0_in + tempMoneyFlowObj[stock].r1_in
            -(tempMoneyFlowObj[stock].r0_out + tempMoneyFlowObj[stock].r1_out)
        var mktCap = martketCap(tempMoneyFlowObj[stock]);

        if (tempMoneyFlowObj[stock].price_inc<minPriceInc 
            && inamount> Math.min(minInRatio*mktCap, minInAmount)) {
            strongInStack.push(tempMoneyFlowObj[stock]);
        }

         if (switchFlag) continue;
         if (!last1MoneyFlowObj[stock] || !last2MoneyFlowObj[stock]) {
            //console.log("Error no stock obj", stock);
            continue;
         }
        var tempin = tempMoneyFlowObj[stock].r0_in + tempMoneyFlowObj[stock].r1_in;
        var last1in = last1MoneyFlowObj[stock].r0_in + last1MoneyFlowObj[stock].r1_in;
        var last2in = last2MoneyFlowObj[stock].r0_in + last2MoneyFlowObj[stock].r1_in;
        
        var tempout = tempMoneyFlowObj[stock].r0_out + tempMoneyFlowObj[stock].r1_out;
        var last1out = last1MoneyFlowObj[stock].r0_out + last1MoneyFlowObj[stock].r1_out;
        var last2out = last2MoneyFlowObj[stock].r0_out + last2MoneyFlowObj[stock].r1_out;

        var nettemp = tempin - tempout;
        var netlast1 = last1in - last1out;
        var netlast2 = last2in - last2out;
        var bothflag = false;
        var minIn = Math.min(minInRatioRealTime*mktCap, minInAmountRealTime);
        if ((nettemp - netlast1) > minIn || (netlast1-netlast2<minIn) && (nettemp - netlast2) > minIn) {
            //console.log("--", stock, Math.max((tempin - last1in), (tempin - last2in)), minIn)
            incount++;
            tempMoneyFlowObj[stock].flow = "in";
            tempMoneyFlowObj[stock].realtime_flow = (nettemp - netlast1) > minIn ? (nettemp - netlast1) : nettemp - netlast2;
            strongInStackRealTime.push(tempMoneyFlowObj[stock]);
            // inTempArr.pushI(tempMoneyFlowObj[stock]);
            bothflag = true;
        }

        var minOut = Math.min(minOutRatioRealTime*mktCap, minOutAmountRealTime);
        if ((netlast1 - nettemp) > minOut || (netlast2 - netlast1 < minOut) && (netlast2 - nettemp) > minOut) {
            //console.log(">>", stock, Math.max((tempout - last1out) ,  (tempout - last2out)), minOut)
            outcount++;
            tempMoneyFlowObj[stock].flow = "out";
            tempMoneyFlowObj[stock].realtime_flow = (netlast1 - nettemp) > minOut ? (netlast1 - nettemp) : netlast2 - nettemp;
            strongOutStackRealTime.push(tempMoneyFlowObj[stock]);
            // outTempArr.pushI(tempMoneyFlowObj[stock]);
            if (bothflag) console.log(stock, nettemp, netlast1, netlast2)
        }
    }

    if (!switchFlag) {
        last2MoneyFlowObj = last1MoneyFlowObj;
        last1MoneyFlowObj = tempMoneyFlowObj;
    }

    console.log("----------------------------------------------------new updates ", incount, outcount, strongInStack.length, new Date().toLocaleTimeString());
}

function martketCap(mfobj) {
    return mfobj.trade * (mfobj.volume / (mfobj.turnover/10000));
}



exports.startWatching = startWatching;
exports.stopWatching = stopWatching;
exports.getActiveItems = getActiveItems;
exports.getStroingInItems = getStroingInItems;
exports.getFavourateItems = getFavourateItems;