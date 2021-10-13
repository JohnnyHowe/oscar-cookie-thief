let SHOP_UPDATE_FREQ = 1;
let CLICKS_PER_SECOND = 100;
let SHIMMER_UPDATE_FREQ = 1;


let KITTEN_MILK_FACTORS = {
    "Kitten helpers": 0.1,
}

let BAD_SHIMMER_NAMES = [
    "Ruin!",
    "Clot",
    "Cursed Finger",    // While this is good, we can't consider it due to the way it stacks

    // Building debuffs
    "Slap to the face",
    "Senility",
    "Locusts",
    "Cave-in",
    "Jammed machinery",
    "Recession",
    "Crisis of faith",
    "Magivores",
    "Black holes",
    "Lab disaster",
    "Dimensional calamity",
    "Time jam",
    "Predictable tragedy",
    "Eclipse",
    "Dry spell",
    "Microcosm",
    "Antipattern",
    "Big crunch",
];

let unknownStrings = [];

// ===============================================================================================
// Store: buildings and upgrades
// ===============================================================================================

function updateStore() {
    let bestObject = getBestBuyable();
    if (bestObject) {
        if (canBuy(bestObject)) {
            buy(bestObject);
            updateStore()
        }
    }
}

/**
 * Find the best buyable and return it
 * Object returned is the cookie clicker buyable
 */
function getBestBuyable() {
    let availableItems = getAvailableItems();
    let maxObject = availableItems[0];

    for (let object of availableItems)
        maxObject = superiorBuyable(maxObject, object)
    buy(maxObject);

    return maxObject
}

/**
 * Given two buyables, return the best one
 */
function superiorBuyable(buyable1, buyable2) {
    if (isSuperior(buyable1, buyable2)) {
        return buyable1;
    } else {
        return buyable2;
    }
}

/**
 * Is buyable1 better than buyable 2?
 * This is the heart of the shop brain
 */
function isSuperior(buyable1, buyable2) {
    return getCPSIncrease(buyable1) / getCost(buyable1) > getCPSIncrease(buyable2) / getCost(buyable2);
}

/**
 * For any buyable, how much more cps do we get from it 
 */
function getCPSIncrease(buyable) {
    if (buyable instanceof Game.Upgrade) {
        return getUpgradeCPSIncease(buyable.desc);
    } else {
        return buyable.cps(buyable);
    }
}

/**
 * For any buyable, get the percentage increase that buying it will give
 * TODO make work with special game things
 */
function getCost(buyable) {
    if (buyable instanceof Game.Upgrade) {
        return buyable["basePrice"];
    } else {
        return buyable["price"];
    }
}

/** 
 * Ensures game in buy mode and buys object
 */
function buy(object) {
    if (object) {
        let old = Game.buyMode
        Game.buyMode = 1;
        object.buy()
        Game.buyMode = old;
    }
}

/**
 * What items can we buy?
 */
function getAvailableItems() {
    let items = [];
    for (let name in Game.Objects) {
        let object = Game.Objects[name];
        if (object.locked != 1) {
            items.push(object);
        }
    }
    for (let object of Game.UpgradesInStore) {
        items.push(object);
    }
    return items;
}

/**
 * Do we have enough cookies for this?
 */
function canBuy(object) {
    return object.price <= Game.cookies;
}

// ===============================================================================================
// Upgrade String Parsing
// ===============================================================================================

function addToUnknown(description) {
    if (!unknownStrings.includes(description)) {
        console.log('Unknown desciption: "' + description + '"');
        unknownStrings.push(description);
    }
}

function getUpgradeCPSIncease(description) {
    let r1 = /(.*) are <b>(.*)<\/b> as efficient.*/
    let r1Match = r1.exec(description);
    if (r1Match && r1Match[0] == description) {
        let subject = r1Match[1];
        let change = r1Match[2];
        if (subject === "The mouse and cursors") {
            // TODO handle 
        } else {
            buyable = getObjectFromName(subject);
            if (!buyable) return 0;
            let objCps = buyable.cps(buyable);
            let totalCps = objCps * buyable.bought;
            let totalMultiplied = totalCps * getMultiplier(change);
            let totalIncrease = totalMultiplied - totalCps;
            return totalIncrease;
        }
    }

    let r2Match = /Clicking gains <b>\+(.*\%) of your CpS.*/.exec(description);
    if (r2Match && r2Match[0] == description) {
        return getMultiplier(r2Match[1]) * Game.cookiesPs * CLICKS_PER_SECOND;
    }

    let r3Match = /Cookie production multiplier <b>\+(.*%).*/.exec(description);
    if (r3Match && r3Match[0] == description) {
        return getMultiplier(r3Match[1]) * Game.cookiesPs;
    }

    // TODO
    // "You gain <b>more CpS</b> the more milk you have.<q>meow may I help you</q>"
    // "The mouse and cursors gain <b>+0.1</b> cookies for each non-cursor object owned.<q>clickity</q>"
    addToUnknown(description);
    return 0;
}

function getObjectFromName(subject) {
    // TODO Factorie
    let name = subject.substring(0, subject.length - 1);
    let buyable = Game.Objects[name];
    if (buyable) {
        return buyable;
    } else {
        console.log("Couldn't find gameobject: " + name);
        return null;
    }
}

/**
 * from some change string, get the multipler it represents
 * e.g. twice = 2, +0.1% = 0.001
 */
function getMultiplier(change) {
    let percentRegex = /([0-9,\.]*)\%/

    let percentRegexExec = percentRegex.exec(change);
    if (percentRegexExec && percentRegexExec[0] == change) {
        return parseFloat(percentRegexExec[1]) / 100;
    }

    switch (change) {
        case "twice":
            return 2;
    }
    console.log("Couldn't parse change: " + change);
}

// ===============================================================================================
// Grimoire
// ===============================================================================================

/**
 * Do the Grimoire golden cookie strategy if we can
 * 
 * When a golden cookie is giving us a boost, try buy two more using the Grimoire minigame
 */
function handOfFateStrategyUpdate() {
    let minigame = Game.Objects["Wizard tower"].minigame;
    let spell = minigame.spells["hand of fate"];
    // minigame.castSpell(minigame.spells["hand of fate"]

    if (minigame) {
        // Is there a buff active?
        if (numGoodBuffs() < 1) return;

        // Do we have enough magic?
        if (minigame.magic < spell.costMin + spell.costPercent * minigame.magicM) return;

        // Are we able to use another sugar lump to get more magic? 
        // (has it been 15 minutes since we last did this)
        if (Game.lumpRefill > 0) return;

        // Cast one spell
        minigame.castSpell(minigame.spells["hand of fate"]);

        // Do we have two good buffs?
        if (numGoodBuffs() < 2) {
            console.log("Aborting hand of fate strategy, less than 2 good buffs active.");
            return;
        };

        // Cast second spell
        minigame.castSpell(minigame.spells["hand of fate"]);
    }
}

function numGoodBuffs() {
    let count = 0;
    for (let buff in Game.buffs) {
        if (!BAD_SHIMMER_NAMES.includes(buff)) {
            count += 1;
        }
    }
    return count;
}

// ===============================================================================================
// Not Store
// ===============================================================================================

/** 
 * Collect all the shimmers on the screen (gold, wrath cookies)
 */
function collectShimmers() {
    for (let shimmer of Game.shimmers) {
        shimmer.pop();
        handOfFateStrategyUpdate();
    }
}


// // Get the fattest wrinker (excluding shiny)
// function getFattestWrinker() {
//     let toPop;
//     let withered = 0;
//     for (let wrinkler of Game.wrinklers) {
//         if (wrinkler.type == 0) {
//             if (wrinkler.sucked > withered) {
//                 toPop = wrinkler;
//                 withered = wrinkler.sucked;
//             }
//         }
//     }
//     return toPop;
// }


// // How many wrinklers are there?
// function getNumWrinklers() {
//     let n = 0;
//     for (let wrinkler of Game.wrinklers) {
//         if (wrinkler.sucked > 0) {
//             n += 1;
//         }
//     }
//     return n;
// }


// // Pop the wrinker that has withered the most cookies 
// // With the exception that it is a shiny wrinkler
// function popWrinkers() {
//     if (getNumWrinklers() >= 12) {
//         let fattest = getFattestWrinker();
//         fattest.hp = 0;
//     }
// }


// // Buy all the upgrades the player can currently afford
// function buyAllUpgrades() {
//     for (let upgrade of Game.UpgradesInStore) {
//         if (upgrade.pool !== "toggle") {
//             if (!upgrade.buy()) {
//                 return // If buy failed (not enough money), dont bother checking the others
//             }
//         }
//     }
// }

// // ===============================================================================================
// // Admin
// // ===============================================================================================

function runAtFrequency(code, frequency) {
    if (frequency != 0) {
        setInterval(code, (1.0 / frequency) * 1000);
    }
}


// // Run it yo
console.log("Running Johnny's Cheater");
runAtFrequency(Game.ClickCookie, CLICKS_PER_SECOND);
runAtFrequency(updateStore, SHOP_UPDATE_FREQ);
runAtFrequency(collectShimmers, SHIMMER_UPDATE_FREQ);
