const devicesToken = () => '__devices_token';
const userToken = () => '__user_token';

export const saveDevices = (o) => {
  localStorage.setItem(devicesToken(), JSON.stringify(o));
};

export const fetchDevices = () => {
  const rawDeviceData = localStorage.getItem(devicesToken());
  const devices = JSON.parse(rawDeviceData);

  return devices;
};

export const saveUserDetails = (data) => {
  localStorage.setItem(userToken(), JSON.stringify(data));
};

export const fetchUserDetails = () => {
  const raw = localStorage.getItem(userToken());

  if (raw) {
    return JSON.parse(raw);
  }

  return null;
};
