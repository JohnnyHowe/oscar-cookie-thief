let SHOP_UPDATE_FREQ = 0.5;
let CLICKS_PER_SECOND = 500;
let SHIMMER_UPDATE_FREQ = 0.5;


// Buy the object with the best return when possible
function storeHandler() {
    buyObjectWithBestReturn();
    // setTimeout(storeHandler, (1.0 / UPDATE_FREQUENCY) / 1000);
}


// Buy the item with the best return
function buyObjectWithBestReturn() {
    let object = getObjectWithBestReturn();
    if (object) {
        object.buy();
    }
}


// What items can we buy?
function getAvailableItems() {
    let items = [];
    for (let name in Game.Objects) {
        let object = Game.Objects[name];
        if (object.locked != 1) {
            items.push(object);
        }
    }
    return items;
}


// Get the object with the best return
function getObjectWithBestReturn() {
    let maxObject;
    let maxReturn = 0;

    for (let object of getAvailableItems()) {
        let ret = getReturn(object);
        if (ret > maxReturn || (ret == maxReturn && object.price < maxObject.price)) {
            maxReturn = ret;
            maxObject = object;
        }
    }
    return maxObject
}


// What's the return on the object?
function getReturn(object) {
    let cps = object.cps(object);
    return cps / object.price;
}


// Can we buy this item?
function canBuy(object) {
    return object.price <= Game.cookies;
}


// Collect all the shimmers on the screen (gold, wrath cookies and wrinklers)
function collectShimmers() {
    for (let shimmer of Game.shimmers) {
        shimmer.pop();
    }
}


// Loop at certain frequency
function runAtFrequency(code, frequency) {
    setInterval(code, (1.0 / frequency) * 1000);
}


// Run it yo
console.log("Running Johnny's Cheater");
console.log("Auto clicking, buying (buildings only) and collecting shimmers.");
runAtFrequency(Game.ClickCookie, CLICKS_PER_SECOND);
runAtFrequency(storeHandler, SHOP_UPDATE_FREQ);
runAtFrequency(collectShimmers, SHIMMER_UPDATE_FREQ);