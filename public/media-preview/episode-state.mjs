export function access(episode, state, now = Date.now()) {
  if (!episode || !episode.ready) return 'unavailable';
  if (episode.localPreview) return 'preview';
  if ((state.unlocked || []).includes(episode.id)) return 'unlocked';
  const beforeRelease = state.demoRelease === 'before' || (state.demoRelease !== 'after' && episode.freeAt && now < Date.parse(episode.freeAt));
  return episode.price > 0 && beforeRelease ? 'locked' : 'free';
}

export function recommendation(episodes, state) {
  const ready = episodes.filter(e => e.ready);
  if (!ready.length) return { kind: 'unavailable', episode: null };
  const complete = new Set(state.completed || []);
  if (ready.every(e => complete.has(e.id))) return { kind: 'caught-up', episode: ready[0] };
  const last = [...(state.history || [])].reverse().map(id => ready.find(e => e.id === id)).find(Boolean);
  if (last && !complete.has(last.id) && (state.progress?.[last.id] || 0) > 0) return { kind: 'resume', episode: last };
  const next = last && complete.has(last.id) ? ready.slice(ready.indexOf(last) + 1).find(e => !complete.has(e.id)) : null;
  return { kind: last ? 'continue' : 'start', episode: next || ready.find(e => !complete.has(e.id)) };
}

export function markCompleted(state, episode) {
  const next = structuredClone(state);
  next.completed = [...new Set([...(next.completed || []), episode.id])];
  next.progress = { ...next.progress, [episode.id]: episode.duration || next.progress?.[episode.id] || 0 };
  next.history = [...(next.history || []).filter(id => id !== episode.id), episode.id];
  return next;
}

export function quoteUnlock(state, episode) {
  if (!Number.isInteger(episode?.price) || episode.price < 1) throw new Error('This episode has no valid early-access price.');
  const spent = episode.price, balanceUsed = Math.min(Math.max(0, state.balance), spent);
  const added = spent - balanceUsed, fee = Math.round(added * 10) / 100;
  return { spent, balanceUsed, added, fee, cash: added + fee, balanceAfter: Math.max(0, state.balance) + added - spent };
}

export function purchaseUnlock(state, episode, receipt) {
  if ((state.unlocked || []).includes(episode.id)) return { next: state, duplicate: true };
  const quote = quoteUnlock(state, episode), next = structuredClone(state);
  next.balance = quote.balanceAfter;
  next.unlocked = [...(next.unlocked || []), episode.id];
  next.receipts = [...(next.receipts || []), { ...receipt, kind: 'unlock', episodeId: episode.id, coins: quote.spent, ...quote }];
  return { next, duplicate: false };
}

export function commit(storage, storageKey, next) {
  storage.setItem(storageKey, JSON.stringify(next));
  return next;
}

export function validateSchedule(episode, hasMedia, today) {
  if (!episode.title.trim()) return 'Add an episode title.';
  if (episode.status === 'Scheduled') {
    if (!hasMedia) return 'Attach a video before scheduling this episode.';
    if (!episode.date) return 'Choose a free-release date before scheduling.';
    if (episode.date < today) return 'A scheduled release cannot be in the past.';
  }
  if (episode.early) {
    if (!Number.isInteger(episode.price) || episode.price < 1) return 'Use a whole-number price of at least one coin.';
    if (!episode.date || !episode.earlyDate) return 'Early access needs a start date and a free-release date.';
    if (episode.earlyDate >= episode.date) return 'Early access must begin before the free release.';
    if (episode.status === 'Scheduled' && episode.earlyDate < today) return 'Schedule early access for today or a future date.';
  }
  return '';
}
