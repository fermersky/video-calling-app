const devicesToken = () => '__devices_token';
const nameToken = () => '__name_token';

export const saveDevices = (o) => {
  localStorage.setItem(devicesToken(), JSON.stringify(o));
};

export const fetchDevices = () => {
  const rawDeviceData = localStorage.getItem(devicesToken());
  const devices = JSON.parse(rawDeviceData);

  return devices;
};

export const saveName = (name) => {
  localStorage.setItem(nameToken(), name);
};

export const fetchName = () => {
  return localStorage.getItem(nameToken());
};
