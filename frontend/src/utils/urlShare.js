export function encodeStateToURL(state) {
  const params = new URLSearchParams();

  if (state.mode) params.set('mode', state.mode);
  if (state.salary) params.set('salary', state.salary);
  if (state.desiredNet) params.set('net', state.desiredNet);
  if (state.bonus) params.set('bonus', state.bonus);

  if (state.allowances?.length > 0) {
    const valid = state.allowances.filter((a) => a.name.trim() && parseFloat(a.amount) > 0);
    if (valid.length > 0) params.set('allowances', JSON.stringify(valid));
  }

  if (state.nonResident) params.set('non_resident', '1');

  const r = state.reliefs;
  if (r) {
    if (r.marriage) params.set('marriage', '1');
    if (r.children > 0) params.set('children', String(r.children));
    if (r.disability) params.set('disability', '1');
    if (r.old_age) params.set('old_age', '1');
  }

  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function decodeStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.size === 0) return null;

  const state = {};
  state.mode = params.get('mode') || 'forward';
  state.salary = params.get('salary') || '';
  state.desiredNet = params.get('net') || '';
  state.bonus = params.get('bonus') || '';

  try {
    state.allowances = params.has('allowances')
      ? JSON.parse(params.get('allowances'))
      : [];
  } catch {
    state.allowances = [];
  }

  state.nonResident = params.get('non_resident') === '1';

  state.reliefs = {
    marriage: params.get('marriage') === '1',
    children: parseInt(params.get('children') || '0', 10),
    disability: params.get('disability') === '1',
    old_age: params.get('old_age') === '1',
  };

  return state;
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
