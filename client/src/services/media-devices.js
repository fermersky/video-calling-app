export const getUserMedia = (constraintsObj = { video: true, audio: true }) => {
  return navigator.mediaDevices.getUserMedia(constraintsObj);
};

export const getMediaDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();

  const cameras = filterByKind(devices, 'videoinput');
  const microphones = filterByKind(devices, 'audioinput');
  const speakers = filterByKind(devices, 'audiooutput');

  return [cameras, microphones, speakers];
};

const filterByKind = (devices, kind) => {
  return devices.filter(device => device.kind === kind);
}
