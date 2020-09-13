function init() {
    window.tps = 5.0; //Number of ticks to execute in a second.

    window.ActionType = {
        DO_NOTHING: -1,
        CLICK: 0,
        BUY_BUILDING: 1,
        BUY_UPGRADE: 2,
    }

    window.UpgradeType = {
        DOUBLER: 0, //Doubles the output of a building.
        CLICK_PERCENT: 1, //Increases clicking power by a certain percent.
        CLICK_BOOST: 2, //Increases clicking power by a certain number.
        CLICK_DOUBLER: 7, //Doubles clicking power.
        OTHER_PERCENT: 3, //Increases another building's output by a percent for each of a type of building.
        OTHER_BOOST: 4, //Increases another building's output by a fixed amount for each of a type of building.
        MILK: 5, //Multiplies production based on how much milk you have.
        PERCENT: 6, //Increases overall production multiplier by a percent.
        PRESTIGE: 8, //Unlocks access to a certain amount of prestige.
    }

    window.SimpleUpgrades = [];

    function SimpleUpgrade(effects) {
        window.SimpleUpgrades.push({
            id: window.SimpleUpgrades.length,
            effects: effects,
            price: Game.UpgradesById[window.SimpleUpgrades.length].basePrice,
            unlocked: 0,
            bought: 0
        })
    }

    function DoubleEffects(id) {
        return [{
            type: window.UpgradeType.DOUBLER,
            id: id
        }];
    }

    function ClickDoubleEffects() {
        return [{
            type: window.UpgradeType.CLICK_DOUBLER
        }];
    }

    function CursorBoostEffects(amount) {
        effects = [];
        for (let i = 1; i < Game.ObjectsById.length; i++) {
            effects.push({
                type: window.UpgradeType.OTHER_BOOST,
                sourceId: i,
                targetId: 0,
                amount: amount
            });
        }
        for (let i = 1; i < Game.ObjectsById.length; i++) {
            effects.push({
                type: window.UpgradeType.OTHER_BOOST,
                sourceId: i,
                targetId: -1,
                amount: amount
            });
        }
        return effects;
    }

    function MilkEffects(multiplier) {
        return [{
            type: window.UpgradeType.MILK,
            multiplier: multiplier
        }];
    }

    function PercentEffects(percent) {
        return [{
            type: window.UpgradeType.PERCENT,
            percent: percent
        }];
    }

    function OtherPercentEffects(sourceId, targetId, percent) {
        return [{
            type: window.UpgradeType.OTHER_PERCENT,
            sourceId: sourceId,
            targetId: targetId,
            percent: percent
        }];
    }

    function OtherBoostEffects(sourceId, targetId, amount) {
        return [{
            type: window.UpgradeType.OTHER_BOOST,
            sourceId: sourceId,
            targetId: targetId,
            amount: amount
        }];
    }

    function GrandmaEffects(targetId) {
        return [{
            type: window.UpgradeType.DOUBLER,
            id: 1
        }, {
            type: window.UpgradeType.OTHER_PERCENT,
            sourceId: 1,
            targetId: targetId,
            percent: 0.01 / (targetId - 1) /* 0.01 cps per x grandmas, one more is required per building. */
        }];
    }

    function ClickPercentEffects(percent) {
        return [{
            type: window.UpgradeType.CLICK_PERCENT,
            percent: percent
        }];
    }

    function PrestigeEffects(percent) {
        return [{
            type: window.UpgradeType.PRESTIGE,
            percent: percent
        }];
    }

    //3 Cursor doubling upgrades
    for (let i in [0, 1, 2]) { SimpleUpgrade(DoubleEffects(0).concat(DoubleEffects(-1))); }
    //4 Cursor boost upgrades.
    for (let i of[0.1, 0.5, 5.0, 50.0]) { SimpleUpgrade(CursorBoostEffects(i)); }
    //7 10 13 16 19 22 25 28 are all doubler upgrade for different categories
    for (let i of[1, 2, 4, 3, 8, 9, 10, 11]) {
        for (let j in [0, 1, 2]) {
            SimpleUpgrade(DoubleEffects(i));
        }
    }
    //31, 32: milk upgrades
    SimpleUpgrade(MilkEffects(0.1));
    SimpleUpgrade(MilkEffects(0.125));
    //33-37: 1% boosts
    for (let i in [3, 4, 5, 6, 7]) { SimpleUpgrade(PercentEffects(0.01)); }
    //38-42: 2% boosts
    for (let i in [8, 9, 0, 1, 2]) { SimpleUpgrade(PercentEffects(0.02)); }
    //43: cursor boost
    SimpleUpgrade(CursorBoostEffects(500));
    //44-51: extra doublers, before temples, banks, wizard towers were added.
    //The order is gma, farm, fac, mine, ship, lab, portal, time.
    for (let i of[1, 2, 4, 3, 8, 9, 10, 11]) { SimpleUpgrade(DoubleEffects(i)); }
    //52-53: golden cookie upgrades
    for (let i in [2, 3]) { SimpleUpgrade([]); } //TODO: Make an upgrade type for gc upgrades.
    //54: another cat upgrade
    SimpleUpgrade(MilkEffects(0.15));
    //55-56: 4% upgrades
    for (let i in [5, 6]) { SimpleUpgrade(PercentEffects(0.04)); }
    //57-63: Grandma workers, The order should be farm, mine, fac, ship, lab, portal, time.
    for (let i of[2, 3, 4, 8, 9, 10, 11]) { SimpleUpgrade(GrandmaEffects(i)); }
    //64: Bingo center, TODO: Make it more complicated than just the quadruple effect it provides.
    SimpleUpgrade(DoubleEffects(1).concat(DoubleEffects(1)));
    //65-74: Bingo center research. TODO: Add grandmapocalypse effects.
    SimpleUpgrade(PercentEffects(0.01));
    SimpleUpgrade(PercentEffects(0.02));
    SimpleUpgrade(DoubleEffects(1));
    SimpleUpgrade(PercentEffects(0.03));
    SimpleUpgrade(OtherBoostEffects(1, 1, 0.02)); //+0.02 cps per grandma
    SimpleUpgrade(PercentEffects(0.04));
    SimpleUpgrade(OtherBoostEffects(1, 1, 0.02)); //+0.02 cps per grandma
    SimpleUpgrade(PercentEffects(0.05));
    SimpleUpgrade(OtherBoostEffects(10, 1, 0.02)); //+0.05 cps per portal
    SimpleUpgrade([]); //TODO: Contain the wrath of the elders.
    //75-78 Mouse gains +1% CPS
    for (let i of[5, 6, 7, 8]) { SimpleUpgrade(ClickPercentEffects(0.01)); }
    //79: Cheat upgrade
    SimpleUpgrade([]);
    //80-81: 2% boosts.
    for (let i of[0, 1]) { SimpleUpgrade(PercentEffects(0.02)); }
    SimpleUpgrade(CursorBoostEffects(5000.0));
    SimpleUpgrade([]); //83: Another cheat upgrade
    SimpleUpgrade([]); //84: Stop grandmapocalypse
    SimpleUpgrade([]); //85: Resume grandmapocalypse
    SimpleUpgrade([]); //86: Double golden cookie effect length
    SimpleUpgrade([]); //87: Doulbe length of elder pledges (#75)
    //88-98: British biscuits + snickerdoodles
    for (let i of[8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8]) { SimpleUpgrade(PercentEffects(0.02)); }
    //99-102: Antimatter doublers
    for (let i of[9, 0, 1, 2]) { SimpleUpgrade(DoubleEffects(12)); }
    SimpleUpgrade(GrandmaEffects(12)); //103: Antigrandmas
    //104-107: 2% cookies
    for (let i of[4, 5, 6, 7]) { SimpleUpgrade(PercentEffects(0.02)); }
    SimpleUpgrade(MilkEffects(0.175)); //108: Overseers. TODO: Find out how much they do
    SimpleUpgrade(CursorBoostEffects(50000)); //109
    //110-118: More doublers, one each for gran, farm, fac, mine, ship, lab, portal, time, anti
    for (let i of[1, 2, 4, 3, 8, 9, 10, 11, 12]) { SimpleUpgrade(DoubleEffects(i)); }
    SimpleUpgrade(ClickPercentEffects(0.01)); //119
    //120-123: 3% cookies
    for (let i of[0, 1, 2, 3]) { SimpleUpgrade(PercentEffects(0.03)); }
    SimpleUpgrade([]); //124: debug
    //125-128: 2% cookies
    for (let i of[5, 6, 7, 8]) { SimpleUpgrade(PercentEffects(0.02)); }
    //129-133: Prestige upgrades
    for (let i of[0.05, 0.25, 0.50, 0.75, 1.0]) { SimpleUpgrade(PrestigeEffects(i)); }
    //134-151: 2% seasonal cookies
    for (let i of[4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1]) { SimpleUpgrade(PercentEffects(0.02)); }
    SimpleUpgrade([]); //152: TODO: Santa test tube.
    //153-168: Cost changes with santa level.
    //153-156: Misc santa upgrades.
    for (let i of[0.15, 0.15, 0.01, 0.01]) { SimpleUpgrade(PercentEffects(i)); }
    SimpleUpgrade([]); //157: TODO: Double reindeer frequency.
    SimpleUpgrade([]); //158: TODO: Halve reindeer speed.
    SimpleUpgrade([]); //159: TODO: Double reindeer products.
    SimpleUpgrade([]); //160: TODO: 1% Cheaper buildings.
    SimpleUpgrade([]); //161: TODO: 5% Cheaper upgrades.
    SimpleUpgrade(DoubleEffects(1)); //162: Grandma doubler.
    SimpleUpgrade([]); //163: TODO: 10% more common drops.
    SimpleUpgrade([]); //164: TODO: 10% better cursor.
    SimpleUpgrade([]); //165: TODO: +3% per santa level.
    SimpleUpgrade([]); //166: TODO: 5% more milk.
    SimpleUpgrade([]); //167: Debug.
    SimpleUpgrade([]); //168: TODO: +20% prod, -1% bld cost, -2% upg cost.
    //169-174: 2% cookies
    for (let i of[9, 0, 1, 2, 3, 4]) { SimpleUpgrade(PercentEffects(0.02)); }
    //175-179: Prism doublers
    for (let i of[5, 6, 7, 8, 9]) { SimpleUpgrade(DoubleEffects(13)); }
    SimpleUpgrade(GrandmaEffects(13)); //180: Rainbow grandmas
    SimpleUpgrade([]); //181: TODO: Unlock season switchers
    //182-185: TODO: Season switchers.
    for (let i of[0, 1, 2, 3]) { SimpleUpgrade([]); }
    SimpleUpgrade([]); //186: TODO: Seasons last forever
    SimpleUpgrade(MilkEffects(0.2)); //187: Managers. TODO: Find out how much they do
    SimpleUpgrade(CursorBoostEffects(500.0e3)); //188
    SimpleUpgrade(CursorBoostEffects(5.0e6)); //189
    SimpleUpgrade(ClickPercentEffects(0.01)); //190
    SimpleUpgrade(ClickPercentEffects(0.01)); //191
    //192-201: More doublers, one each for gran, farm, fac, mine, ship, lab, portal, time, anti, prism
    for (let i of[1, 2, 4, 3, 8, 9, 10, 11, 12, 13]) { SimpleUpgrade(DoubleEffects(i)); }
    //202-207: 3% cookies
    for (let i of[2, 3, 4, 5, 6, 7]) { SimpleUpgrade(PercentEffects(0.03)); }
    SimpleUpgrade(PercentEffects(1000.0)); //208: Magic.
    SimpleUpgrade([]); //209: TODO: Switch to easter.
    //210-229: Eggs, cost scales.
    //210-221: 1% eggs
    for (let i of[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1]) { SimpleUpgrade(PercentEffects(0.01)); }
    //222-229: TODO: various effects
    for (let i of[2, 3, 4, 5, 6, 7, 8, 9]) { SimpleUpgrade([]); }
    //230-231: misc 3% cookies
    SimpleUpgrade(PercentEffects(0.03));
    SimpleUpgrade(PercentEffects(0.03));
    //232-237: Bank doublers
    for (let i of[2, 3, 4, 5, 6, 7]) { SimpleUpgrade(DoubleEffects(5)); }
    //238-243: Temple doublers
    for (let i of[8, 9, 0, 1, 2, 3]) { SimpleUpgrade(DoubleEffects(6)); }
    //244-249: Wizard tower doublers
    for (let i of[4, 5, 6, 7, 8, 9]) { SimpleUpgrade(DoubleEffects(7)); }
    //250-252: Banker, priestess, witch grandmas
    for (let i of[5, 6, 7]) { SimpleUpgrade(GrandmaEffects(i)); }
    //253-255: TODO: Tea biscuit, macaron, branded cookie boxes
    for (let i of[3, 4, 5]) { SimpleUpgrade([]); }
    //256-257: 4% cookies
    for (let i of[6, 7]) { SimpleUpgrade(PercentEffects(0.04)); }
    //258-263: 3% cookies
    for (let i of[8, 9, 0, 1, 2, 3]) { SimpleUpgrade(PercentEffects(0.03)); }
    //264-268: TODO: Permanent upgrade slots.
    for (let i of[4, 5, 6, 7, 8]) { SimpleUpgrade([]); }
    //269-293: TODO: Misc prestige upgrades.
    for (let i = 269; i <= 293; i++) { SimpleUpgrade([]); }
    //294-306: More doublers, one each for gran, farm, mine, fac, bank, temp, wiz, ship, lab, portal, time, anti, prism
    for (let i of[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) { SimpleUpgrade(DoubleEffects(i)); }
    //307-319: More doublers, one each for gran, farm, mine, fac, bank, temp, wiz, ship, lab, portal, time, anti, prism
    for (let i of[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) { SimpleUpgrade(DoubleEffects(i)); }
    //320-322: Accountants - experts. TODO: Find out how much they do.
    for (let i of[0.2, 0.2, 0.2]) { SimpleUpgrade(MilkEffects(i)); }
    //323-333: TODO: Misc prestige upgrades.
    for (let i = 323; i <= 333; i++) { SimpleUpgrade([]); }
    //334-337: 10% cookies.
    for (let i of[4, 5, 6, 7]) { SimpleUpgrade(PercentEffects(0.1)) }
    //338-343: 4% cookies.
    for (let i of[8, 9, 0, 1, 2, 3]) { SimpleUpgrade(PercentEffects(0.04)); }
    SimpleUpgrade(PercentEffects(0.02)); //344: Digits, broke the streak :(
    //345-352: More 4% cookies.
    for (let i of[5, 6, 7, 8, 9, 0, 1, 2]) { SimpleUpgrade(PercentEffects(0.04)); }
    //353-365: TODO: Misc prestige upgrades.
    for (let i = 353; i <= 365; i++) { SimpleUpgrade([]); }
    //I think that's enough for now...

    console.log(SimpleUpgrades);
}

function doBotAction(action) {
    if (action.type == ActionType.CLICK) {
        Game.ClickCookie();
    } else if (action.type == ActionType.BUY_BUILDING) {
        Game.ObjectsById[action.id].buy();
        console.log("Bought ", Game.ObjectsById[action.id].name, " (id: ", action.id, ")");
    } else if (action.type == ActionType.BUY_UPGRADE) {
        Game.UpgradesById[action.id].buy();
        console.log("Bought ", Game.UpgradesById[action.id].name, " (id: ", action.id, ")");
    }
}

function botLoop() {
    let state = {};
    state.cookies = Game.cookies;
    state.cps = Game.cookiesPs;
    state.tps = window.tps;
    state.milk = Game.AchievementsOwned * 0.04;
    state.buildings = [];
    for (index in Game.ObjectsById) {
        let building = Game.ObjectsById[index];
        state.buildings[index] = {
            bought: building.amount,
            cps: building.cps(building),
            rawCps: [0.1, 1, 8, 47, 260, 1.4e3, 7.8e3, 44.0e3, 0.26e6, 1.6e6, 10.0e6, 65.0e6, 0.43e9, 2.9e9][index],
            price: building.price
        }
    }
    state.upgrades = window.SimpleUpgrades
    for (index in state.upgrades) {
        state.upgrades[index].unlocked = Game.UpgradesById[index].unlocked;
        state.upgrades[index].bought = Game.UpgradesById[index].bought;
    }
    doBotAction(window.botCallback(state));
    setTimeout(botLoop, 1000.0 / window.tps);
}

function toggleUpgrade(index) {
    Game.UpgradesById[index].basePrice = 9e99;
    Game.UpgradesById[index].toggle();
}

function loadBot(event) {
    let scriptReader = new FileReader();
    scriptReader.onload = function(file) {
        eval(scriptReader.result);
    }
    if (event.target.files.length == 0) {
        window.botCallback = window.defaultBotCallback;
    } else {
        scriptReader.readAsText(event.target.files[0]);
    }
}

function inject() {
    let versionDiv = document.querySelector("div#versionNumber");
    if ((versionDiv) && (versionDiv.innerHTML)) {
        versionDiv.innerHTML = "Load a Bot: <input type='file'/>";
        versionDiv.children[0].addEventListener('change', loadBot, false);
        init();
        botLoop();
    } else {
        setTimeout(inject, 1000); //Try again later.
    }
}

window.defaultBotCallback = function(state) { console.log("No bot loaded!"); return { type: ActionType.DO_NOTHING }; };
window.botCallback = window.defaultBotCallback;
inject();