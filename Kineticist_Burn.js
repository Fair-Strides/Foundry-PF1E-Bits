const opt = {
    // ownerChentric
    // true = speaker > selected > configured  – great for very owner centric selection
    // false = selected > configured > speaker – great for flexibility on who rolls (for requesting rolls, better for most circumstances)
    bOwnerCentric: false, // Favor owner. If False, favors configuration/selection.
    bCountUp: true,
    bIgnoreCap: false,
    bIsInfusion: false,
    bHasSuperCharge: false,
    bNonlethal: true,
    iBurnCost: 0,
    iGatherPowerCost: 0,
    iInfusionCost: 0,
    iMetaKinesisCost: 0,
    iKineticistLevel: 0,
    iInfusionSpecialLevel: 0,
    sBurnTag: "classFeat_burn",
    sBurnTagAlt: "burn"
}

// returns null if the passed actor is not owned
const filterUnownedActor = (actor) => actor?.owner ? actor : null; // do we have owner permission

const firstNonEmpty = (a, b, c) => {
	const a2 = a.filter(x => x != null);
	if (a2.length) return a2;
	const b2 = b.filter(x => x != null);
	if (b2.length) return b2;
	return c.filter(x => x != null);
};

// ugh
const actors = opt.ownerCentric
	? // speaker > selected > configured – great for very owner centric selection
	firstNonEmpty(
	    canvas.tokens.controlled.map(t => t.actor),
		[game.user.character])
	: // selected > configured > speaker – great for flexibility on who rolls
	firstNonEmpty(
		canvas.tokens.controlled.map(t => t.actor),
		[game.user.character]);

if (!actors.length) {
	ui.notifications.error("No actor selected.");
    return;
}

opt.iKineticistLevel = actors[0].classes.kineticist?.level ?? 0;
opt.iInfusionSpecialLevel = Math.max(0, Math.floor((opt.iKineticistLevel - 2) / 3));
opt.bHasSuperCharge = actors[0].classes.kineticist?.level > 10 ?? false;

let burnResource = actors[0].items.find(o => o.system.tag === opt.sBurnTag);
if(burnResource === undefined) {
    burnResource = actors[0].items.find(o => o.system.tag === opt.sBurnTagAlt);
    if(burnResource === undefined) {
        ui.notifications.error("No Burn resource on " + actors[0].name);
        return;
    }
}

async function assignBurn(burnVictim) {
console.log("FS | Burn Victim: ", burnVictim, "\nInfusion Cost: ", opt.iInfusionCost, "\nInfusionSpecialization: ", opt.iInfusionSpecialLevel, "\nBurn Cost 1: ", opt.iBurnCost);
    let burnCost = parseInt(opt.iBurnCost);
    burnCost += parseInt(opt.iMetaKinesisCost);
console.log("FS | Burn Cost 2: ", burnCost);
    if(opt.bIsInfusion === true) {
         burnCost += parseInt(opt.iInfusionCost);
console.log("FS | Burn Cost 3: ", burnCost);
         burnCost -= Math.min(parseInt(opt.iInfusionCost), parseInt(opt.iInfusionSpecialLevel));
console.log("FS | Burn Cost 4: ", burnCost);
    }

    burnCost -= parseInt(opt.iGatherPowerCost);
console.log("FS | Burn Cost 5: ", burnCost);
    if(opt.bHasSuperCharge === true) {
        burnCost -= parseInt(opt.iGatherPowerCost);
console.log("FS | Burn Cost 6: ", burnCost);
    }

    if(burnCost > 0) {
        if(opt.bIgnoreCap === false) {
            if((Math.abs(burnResource.system.uses.max - burnResource.system.uses.value)) < burnCost) {
                ui.notifications.warn(burnVictim.name + " does not have enough Burn to spend.");
                return;
            }
        }

        if(opt.bCountUp === false) {
            burnResource.update({"system.uses.value": burnResource.system.uses.value - burnCost});
        }
        else {
            burnResource.update({"system.uses.value": burnResource.system.uses.value + burnCost});
        }

        burnVictim.updateEmbeddedDocuments("Item", [{ _id: burnResource.id}]);

        if(opt.bNonlethal === true) {
  //          console.log("FS | Dealing Nonlethal: ", opt.iKineticistLevel, " * ", burnCost, " = ", (opt.iKineticistLevel * burnCost));
            burnVictim.update({"system.attributes.hp.nonlethal": burnVictim.system.attributes.hp.nonlethal + (opt.iKineticistLevel * burnCost)});
        }
    }
    this.close();
}

async function toggleInfusion() {
//console.log("FS | bIsInfusion before: ", opt.bIsInfusion);
    opt.bIsInfusion = !opt.bIsInfusion;
//console.log("FS | bIsInfusion after: ", opt.bIsInfusion);
//    if(opt.bIsInfusion === 1) { opt.bIsInfusion = 0; }
//    else { opt.bIsInfusion = 1; }
}

async function toggleCountDirection() {
    opt.bCountUp = !opt.bCountUp;
}

async function toggleBurnCap() {
    opt.bIgnoreCap = !opt.bIgnoreCap;
}

async function toggleDamage() {
    opt.bNonlethal = !opt.bNonlethal;
}

async function toggleSuperCharge() {
    opt.bHasSuperCharge = !opt.bHasSuperCharge;
}

async function selectGatherPower(event) {
//    console.log("FS | Gather Power Cost before: ", opt.iGatherPowerCost);
    opt.iGatherPowerCost = event.target.value;
//    console.log("FS | Gather Power Cost after: ", opt.iGatherPowerCost);
}

async function selectMetaKinesis(event) {
    opt.iMetaKinesisCost = event.target.value;
}

async function setClassLevel(event) {
    opt.iKineticistLevel = event.target.value;
}

async function setBurnCost(event) {
    opt.iBurnCost = event.target.value;
}

async function setInfusionCost(event) {
    opt.iInfusionCost = event.target.value;
}

async function setInfusionSpecialization(event) {
    opt.iInfusionSpecialLevel = event.target.value;
}

let html = `<div>
<div>
  <div class='flexrow'>
    <label for="ClassLevel">Kineticist Level: </label>
    <input name="ClassLevel" id="ClassLevel" type="number" min="0" max="20" value='${opt.iKineticistLevel}'></input>
  </div>
  <div class='flexrow'>
    <label for="BurnCost">Burn Cost: </label>
    <input name="BurnCost" id="BurnCost" type="number" min="0" value='${opt.iBurnCost}'></input>
  </div>
  <div class='flexrow'>
    <label for="InfusionCost">Infusion Cost: </label>
    <input name="InfusionCost" id="InfusionCost" type="number" min="0" value='${opt.iInfusionCost}'></input>
  </div>
  <div class='flexrow'>
    <label for="GatherPower">Gather Power Level: </label>
    <select name="GatherPower" id="GatherPower">
      <option value=0>None</option>
      <option value=1>Move Action</option>
      <option value=2>Full-Round Action</option>
      <option value=3>Move + Full-Round Action</option>
    </select>
  </div>
  <div class='flexrow'>
    <label for="InfusionSpecialization">Infusion Specialization: </label>
    <input name="InfusionSpecialization" id="InfusionSpecialization" type="number" min="0" max="6" value='${opt.iInfusionSpecialLevel}'></input>
  </div>
</div>
<div>
  <div class='flexrow'>
    <label for="CountBox">Use counts up?: </label>
    <input type="checkbox" name="CountBox" id="CountBox" value='${opt.bCountUp}' checked></input>
  </div>
  <div class='flexrow'>
    <label for="BurnCapBox">Ignore Burn cap?: </label>
    <input type="checkbox" name="BurnCapBox" id="BurnCapBox" value='${opt.bIgnoreCap}'></input>
  </div>
  <div class='flexrow'>
    <label for="DamageBox">Deal nonlethal?: </label>
    <input type="checkbox" name="DamageBox" id="DamageBox" value='${opt.bNonlethal} checked' checked></input>
  </div>
  <div class='flexrow'>
    <label for="IsInfusionBox">Is using an Infusion?: </label>
    <input type="checkbox" name="IsInfusionBox" id="IsInfusionBox" value='${opt.bIsInfusion}'></input>
  </div>
  <div class='flexrow'>
    <label for="SuperChargeBox">Can Supercharge?: </label>
    <input type="checkbox" name="SuperChargeBox" id="SuperChargeBox" value='${opt.bHasSuperCharge}'`;

if(opt.bHasSuperCharge === true) { html += `checked`; }

	html += `></input>
  </div>
</div>
<div>
  <div class='flexrow'>
    <label for="MetaKinesis">Metakinesis Applied: </label>
    <select name="MetaKinesis" id="MetaKinesis">
      <option value=0>None</option>
`;

if(opt.iKineticistLevel > 4) {
    html += `<option value=1>Empowered</option>`;
}
if(opt.iKineticistLevel > 8) {
    html += `<option value=2>Maximized</option>
<option value=3>Empowered + Maximized</option>`;
}
if(opt.iKineticistLevel > 12) {
    html += `<option value=3>Quickened</option>
<option value=4>Empowered + Quickened</option>
<option value=5>Maximized + Quickened</option>
<option value=6>Empowered + Maximized + Quickened</option>`;
}
if(opt.iKineticistLevel > 16) {
html += `<option value=4>Doubled</option>
<option value=5>Empowered + Doubled</option>
<option value=6>Maximized + Doubled</option>
<option value=7>Quickened + Doubled</option>
<option value=7>Empowered + Maximized + Doubled</option>
<option value=8>Empowered + Quickened + Doubled</option>
<option value=9>Maximized + Quickened + Doubled</option>
<option value=10>Empowered + Maximized + Quickened + Doubled</option>`;
}

html += `</select></div>
  <div class="flexrow">
    <button name="submit" id="submit">Accept the Burn!</button>
  </div>
</div></div>`;

let d = new Dialog({
  title: "How much do you Burn?",
  content: html,
  buttons: {
      cancel: {label: 'Cancel', callback: ()=>d.close()}//,
//      submit: {label: 'Accept the Burn!', callback: ()=> { assignBurn(this, actors[0]); }}
  }    
});

d.activateListeners = function(html) {
    Dialog.prototype.activateListeners.call(this, html);

//    console.log("FS | Here.\nActor ", actors[0], "\nButton: ", html.find("button.submit"));
    html.find("button#submit").click(assignBurn.bind(this, actors[0]));
//    console.log("FS | Here\n");

    html.find("input#ClassLevel").change(setClassLevel.bind(this));
    html.find("input#BurnCost").change(setBurnCost.bind(this));
    html.find("input#InfusionCost").change(setInfusionCost.bind(this));
    html.find("input#InfusionSpecialization").change(setInfusionSpecialization.bind(this));

    html.find("input#CountBox").click(toggleCountDirection.bind(this));
    html.find("input#BurnCapBox").click(toggleBurnCap.bind(this));
    html.find("input#DamageBox").click(toggleDamage.bind(this));
    html.find("input#IsInfusionBox").click(toggleInfusion.bind(this));
    html.find("input#SuperChargeBox").click(toggleSuperCharge.bind(this));

    html.find("select#GatherPower").change(selectGatherPower.bind(this));
    html.find("select#MetaKinesis").change(selectMetaKinesis.bind(this));
};

d.render(true);