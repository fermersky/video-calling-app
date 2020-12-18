const devicesToken = () => "__devices_token";

export const saveDevices = (o) => {
    localStorage.setItem(devicesToken(), JSON.stringify(o))
}

export const fetchDevices = () => {
    const rawDeviceData = localStorage.getItem(devicesToken());
    const devices = JSON.parse(rawDeviceData);

    return devices;
}