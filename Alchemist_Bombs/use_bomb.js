let theActor = token?.actor ?? actor;
let attackUses = shared.attackData.attacks.length;
let newUses = item.system.uses.value - attackUses;

if(newUses < 0) shared.reject = true;
else if( item.links?.charges?._id !== undefined) {
    const chargeItem = theActor.items.find(i => i.id === item.links.charges.id);
    await chargeItem?.addCharges(-attackUses);
}
else {
    await item.addCharges(-attackUses);
}
