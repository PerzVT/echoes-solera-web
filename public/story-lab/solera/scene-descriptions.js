const names={nova:'Nova',ya:'Ya',oren:'Or-en'};
export function describeScene(scene,character='nova') {
  const who=names[scene.character||character]||'The traveler';
  const shared={
    selection:'Ya, Nova, and Or-en at the guild’s character-selection display.',
    classes:'Three guild entrances: the Archery Range, Training Grounds, and Summoner’s Lair.',
    'challenge-door':'The entrance to the guild’s challenge chamber.',
    'challenge-empty':'An open challenge chamber before the encounter begins.',
    'titan-reveal':'Titan Truffle towers over the challenge chamber.',
    'titan-step':'A close view of Titan Truffle moving across the challenge floor.',
    'door-sealed':'The closed doors of the challenge chamber after the retreat.',
    spawn:'Nova inside a glass arrival capsule in the guild hall.',
    'oren-village-departure':'Or-en sets out from the village.',
    'oren-city-sneak':'Or-en finds a small opening at the city entrance.',
    'oren-guild-sneak':'Or-en enters the guild hall.',
    'oren-lobby-wait':'Or-en waits near a bench in the guild lobby.'
  };
  if(shared[scene.id])return shared[scene.id];
  if(scene.id==='lobby')return character==='oren'?'Or-en waits by the guild bench as Nova and Ya stand nearby.':`${who} approaches familiar companions near the guild’s lobby bench.`;
  const suffix=scene.id.replace(/^(nova|ya|oren)-/,'');
  const actions={
    spawn:'inside a glass arrival capsule.',exit:'leaving the arrival capsule.',threshold:'entering the guild foyer.',greeting:'in the guild foyer during the welcome sequence.',scan:'at the guild identification station.',registered:'holding a newly issued guild identification card.',reaction:'looking at the new guild identification.',guidance:'facing the guild’s training entrances.',
    'sword-start':'in the sword-training area.','sword-pickup':'reaching for a practice blade.','sword-awaken':'holding a practice sword as mana glows along it.','sword-ready':'facing the ADA practice bot in the training lane.','sword-strike':'sending a crescent of mana toward the practice target.','sword-reset':'beside the instructor and practice bot at the weapon rack.',
    'bow-start':'in the archery-training area.','bow-pickup':'holding a practice bow.','bow-draw':'drawing the bow toward the range target.','bow-release':'releasing a shot in the archery range.','bow-reset':'with the instructor after archery practice.',
    'summon-start':'in the summoning chamber.','summon-focus':'holding a glowing summoning focus.','summon-arrive':'beside a newly summoned small dragon.','summon-bond':'facing the small summoned dragon.','summon-command':'practicing with the summoned dragon.','summon-recall':'holding the focus at the end of summoning practice.',
    'sword-choice':'near the challenge-room entrance.','bow-choice':'near the challenge-room entrance.','summon-choice':'near the challenge-room entrance.',
    'challenge-entry':'entering the challenge chamber.','boss-reaction':'reacting inside the challenge chamber.','dragon-reaction':'reacting alongside the summoned dragon in the chamber.','boss-run':'running toward the challenge-room exit.','dragon-run':'retreating with the dragon toward the exit.','boss-gulp':'outside the closed challenge doors after the retreat.','dragon-gulp':'with the dragon after leaving the challenge room.','dragon-recall':'holding the summoning focus after the retreat.','dragon-call':'calling the dragon beside the challenge doorway.'
  };
  if(actions[suffix])return `${who} ${actions[suffix]}`;
  if(suffix.startsWith('meet-'))return `${who} meets ${names[suffix.slice(5)]||'a companion'} in the guild lobby.`;
  if(suffix.startsWith('leave-'))return `${who} and ${names[suffix.slice(6)]||'a companion'} leave the guild together.`;
  return scene.alt||scene.title;
}
