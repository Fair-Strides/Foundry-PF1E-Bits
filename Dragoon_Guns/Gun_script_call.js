let ammoName = 'Dragoon Cartridge';

let theActor = !!token ? token.actor : actor;
let ammo = theActor.items.find(o => o.type === 'loot' && o.name === ammoName);

await theActor.updateEmbeddedDocuments("Item", [{_id: item.id, 'data.uses.value': item.data.data.uses.value - (attacks.length - 0)}]);

if(ammo === undefined) {
	ui.notifications.warn(ammoName + " not found on " + theActor.name);
}
else if(ammo.data.data.quantity === 0) {
    ui.notifications.warn(theActor.name + " does not have any more " + ammoName);
}
else if (item.data.data.uses.value === 0) {
    theActor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses.value": 3}, {_id: ammo.id, "data.quantity": (ammo.data.data.quantity - 1)}]);
}