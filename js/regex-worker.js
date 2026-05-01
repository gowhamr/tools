self.onmessage = function(e) {
  const { pattern, flags, testStr } = e.data;
  try {
    const re = new RegExp(pattern, flags);
    const matches = [...testStr.matchAll(re)].map(m => ({
      index: m.index,
      value: m[0]
    }));
    self.postMessage({ type: 'result', matches });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message });
  }
};
