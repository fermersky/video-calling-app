export const createLogger = (...fns) => {
  return (initial) => fns.reduce((param, func) => func(param), initial);
};

export const rtcLog = createLogger((x) => {
  console.log(`%c👉👈 (webrtc) ${x}`, `color: #2dd713; font-weight: bold; font-size: 0.9rem; `);
  return x;
});

export const rtcError = createLogger((x) => {
  console.log(`%c❌❌ (webrtc) ${x}`, `color: tomato; font-weight: bold; font-size: 0.9rem; `);
  return x;
});
