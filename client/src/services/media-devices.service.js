export const getUserMedia = (constraintsObj = { video: true, audio: true }) => {
  return navigator.mediaDevices.getUserMedia(constraintsObj);
};

export const getMediaDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();

  const cameras = devices.filter((d) => d.kind === "videoinput");
  const microphones = devices.filter((d) => d.kind === "audioinput");
  const speakers = devices.filter((d) => d.kind === "audiooutput");

  return [cameras, microphones, speakers];
};
