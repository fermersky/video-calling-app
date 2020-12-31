export const getUserMedia = (constraintsObj = { video: true, audio: true }) => {
  return navigator.mediaDevices.getUserMedia(constraintsObj);
};

export const getDisplayMedia = () => {
  return navigator.mediaDevices.getDisplayMedia();
};

export const getMediaDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();

  const cameras = filterByKind(devices, 'videoinput');
  const microphones = filterByKind(devices, 'audioinput');
  const speakers = filterByKind(devices, 'audiooutput');

  return [cameras, microphones, speakers];
};

export const generateConstraintsObject = (camera, microphone) => {
  const generateDeviceConfig = (device) => {
    if (device) {
      return {
        deviceId: {
          exact: device.deviceId,
        },
      };
    }

    return true;
  };

  return {
    video: generateDeviceConfig(camera),
    audio: generateDeviceConfig(microphone),
  };
};

const filterByKind = (devices, kind) => {
  return devices.filter((device) => device.kind === kind);
};
