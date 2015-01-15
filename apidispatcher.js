var moneyFlowWatcher = require("./moneyflowwatcher");
var stockUtil = require("./stockutil");

function getFavourateItems(params, callback) {
    callback(JSON.stringify(moneyFlowWatcher.getFavourateItems(params.list)));
}
exports.getFavourateItems = getFavourateItems;

function getStockInfo(params, callback) {
    callback(JSON.stringify(stockUtil.getStockInfo(params.symbol)));
}
exports.getStockInfo = getStockInfo;

function getStroingInItems(params, callback) {
    var items = moneyFlowWatcher.getStroingInItems(params.time?Number(params.time):0, params.max?Number(params.max):10000)
    callback(JSON.stringify(items));
}
exports.getStroingInItems = getStroingInItems;


function getActiveItems(params, callback) {
    var items = moneyFlowWatcher.getActiveItems(params.flow, params.time?Number(params.time):0, params.max?Number(params.max):10000)
    callback(JSON.stringify(items));
}
exports.getActiveItems = getActiveItems;

function startWatching(params, callback){
    var interval = params.interval? Number(params.interval): 15000;
    moneyFlowWatcher.startWatching(interval);
    console.log("startWatching interval=", interval);
    callback("startWatching")
}
exports.startWatching = startWatching;

function stopWatching(params, callback){
    moneyFlowWatcher.stopWatching();
    callback("stopWatching")
}
exports.stopWatching = stopWatching;