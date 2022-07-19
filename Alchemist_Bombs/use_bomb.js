let theActor = token?.actor ?? actor;
let newUses = item.data.data.uses.value - attacks.length;

if( item.links?.charges?._id !== undefined) {
    await theActor.updateEmbeddedDocuments("Item", [{_id: item.links.charges.id, 'data.uses.value': newUses}]);
}
else {
    await theActor.updateEmbeddedDocuments("Item", [{_id: item.id, 'data.uses.value': newUses}]);
}