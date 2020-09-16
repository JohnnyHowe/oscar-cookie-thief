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
            object.buy();
            buyObjectWithBestReturn(); // Chain buy
        }
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


// // What object should be bought?
// // If the cheapest has the best cps per cost, buy that
// // return best object
// function compareValue(object1, object2) {

//     // Is what one is cheapest?
//     let cheapObj = object1;
//     let expensiveObj = object2;
//     if (object1.price > object2.price) {
//         cheapObj = object2;
//         expensiveObj = object1;
//     }

//     // Does the cheapest have a higher cps per cost?
//     if (getCPSperCost(cheapObj) > getCPSperCost(expensiveObj)) {
//         return cheapObj;
//     }

//     // Will buying the cheap object get us to the expensive one quicker?
//     timeToBuyCheap = cheapObj.price / totalCPS;
//     timeToBuyExpensive = expensiveObj.price / totalCPS;

//     timeToBuyBoth = timeToBuyCheap + timeToBuyExpensive;
//     timeToBuyBoth *= totalCPS / (totalCPS + getObjectCPS(cheapObj));

//     if (timeToBuyBoth < timeToBuyExpensive) {
//         return cheapObj;
//     } else {
//         return expensiveObj;
//     }
// }


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


// Pop all wrinklers on screen
function popAllWrinklers() {
    for (let wrinkler of Game.wrinklers) {
        wrinkler.hp = 0;
    }
}


// // Given an avaliable upgrade, parse the desc to get the goods
// function upgradeParser(upgrade) {
//     desc = upgrade.desc;
// }


// Buy all the upgrades the player can currently afford
function buyAllUpgrades() {
    for (let upgrade of Game.UpgradesInStore) {
        if (!(upgrade.pool === "toggle")) {
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
runAtFrequency(popAllWrinklers, WRINKER_POP_FREQ);
runAtFrequency(updateTotalCPS, CPS_CHECK_FREQ);
runAtFrequency(buyAllUpgrades, UPGRADE_PURCHASE_FREQ);