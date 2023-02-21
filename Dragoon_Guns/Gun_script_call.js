let ammoName = 'Dragoon Cartridge';

let theActor = !!token ? token.actor : actor;
let ammo = theActor.items.find(o => o.type === 'loot' && o.name === ammoName);

await theActor.updateEmbeddedDocuments("Item", [{_id: item.id, 'system.uses.value': item.system.uses.value - (shared.attackData.attacks.length - 0)}]);

if(ammo === undefined) {
	ui.notifications.warn(ammoName + " not found on " + theActor.name);
}
else if(ammo.system.quantity === 0) {
    ui.notifications.warn(theActor.name + " does not have any more " + ammoName);
}
else if (item.system.uses.value === 0) {
    theActor.updateEmbeddedDocuments("Item", [{_id: item.id, "system.uses.value": 3}, {_id: ammo.id, "system.quantity": (ammo.system.quantity - 1)}]);
}