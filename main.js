let SHOP_UPDATE_FREQ = 1;
let CLICKS_PER_SECOND = 500;
let SHIMMER_UPDATE_FREQ = 4;
let WRINKER_POP_FREQ = 0.1;
let UPGRADE_PURCHASE_FREQ = 1;
let CPS_CHECK_FREQ = 0;

let totalCPS;


// Buy the object with the best return when possible
function storeHandler() {
    buyObjectWithBestReturn();
}


// Buy the item with the best return
function buyObjectWithBestReturn() {
    let object = getObjectWithBestReturn();
    if (object) {
        if (canBuy(object)) {
            buy(object)
            buyObjectWithBestReturn(); // Chain buy
        }
    }
}

// Ensures game in buy mode and buys object
function buy(object) {
    let old = Game.buyMode
    Game.buyMode = 1;
    object.buy()
    Game.buyMode = old;
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
    let availableItems = getAvailableItems();
    let maxObject = availableItems[0];

    for (let object of availableItems)
        if (getCPSPerCost(maxObject) < getCPSPerCost(object)) {
            maxObject = object;
        }
    return maxObject
}


// What's the CPS per cost?
function getCPSPerCost(object) {
    return getObjectCPS(object) / object.price;
}


let lastCookies = Game.cookies;
let lastUpdateTime = Date.now();
// Update the totalCPS
// Includes auto clicking
function updateTotalCPS() {
    let currentTime = Date.now() / 1000.0;
    let currentCookies = Game.cookies;
    let cookieDiff = currentCookies - lastCookies;
    let timeDiff = currentTime - lastUpdateTime;
    totalCPS = cookieDiff / timeDiff;
    lastCookies = currentCookies;
    lastUpdateTime = currentTime;
}


// CPS of object?
function getObjectCPS(obj) {
    return obj.cps(obj);
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
    if (frequency != 0) {
        setInterval(code, (1.0 / frequency) * 1000);
    }
}


// Get the fattest wrinker (excluding shiny)
function getFattestWrinker() {
    let toPop;
    let withered = 0;
    for (let wrinkler of Game.wrinklers) {
        if (wrinkler.type == 0) {
            if (wrinkler.sucked > withered) {
                toPop = wrinkler;
                withered = wrinkler.sucked;
            }
        }
    }
    return toPop;
}


// How many wrinklers are there?
function getNumWrinklers() {
    let n = 0;
    for (let wrinkler of Game.wrinklers) {
        if (wrinkler.sucked > 0) {
            n += 1;
        }
    }
    return n;
}


// Pop the wrinker that has withered the most cookies 
// With the exception that it is a shiny wrinkler
function popWrinkers() {
    if (getNumWrinklers() >= 12) {
        let fattest = getFattestWrinker();
        fattest.hp = 0;
    }
}


// Buy all the upgrades the player can currently afford
function buyAllUpgrades() {
    for (let upgrade of Game.UpgradesInStore) {
        if (upgrade.pool !== "toggle") {
            if (!upgrade.buy()) {
                return // If buy failed (not enough money), dont bother checking the others
            }
        }
    }
}


// Run it yo
console.log("Running Johnny's Cheater");
console.log("Auto clicking, buying (buildings only) and collecting shimmers.");
runAtFrequency(Game.ClickCookie, CLICKS_PER_SECOND);
runAtFrequency(storeHandler, SHOP_UPDATE_FREQ);
runAtFrequency(collectShimmers, SHIMMER_UPDATE_FREQ);
runAtFrequency(popWrinkers, WRINKER_POP_FREQ);
runAtFrequency(updateTotalCPS, CPS_CHECK_FREQ);
runAtFrequency(buyAllUpgrades, UPGRADE_PURCHASE_FREQ);