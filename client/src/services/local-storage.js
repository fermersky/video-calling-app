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

export const saveUserDetails = (name) => {
  localStorage.setItem(userToken(), name);
};

export const fetchUserDetails = () => {
  return localStorage.getItem(userToken())?.name;
};
