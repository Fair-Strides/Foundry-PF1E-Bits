let theActor = token?.actor ?? actor;
let newUses = item.system.uses.value - shared.attackData.attacks.length;

if( item.links?.charges?._id !== undefined) {
    await theActor.updateEmbeddedDocuments("Item", [{_id: item.links.charges.id, 'system.uses.value': newUses}]);
}
else {
    await theActor.updateEmbeddedDocuments("Item", [{_id: item.id, 'system.uses.value': newUses}]);
}