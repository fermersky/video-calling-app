const socket = io('https://calling-daniel-application.herokuapp.com/');

export const on = (event, fn) => {
  socket.on(event, fn);
};

export const off = (event) => {
  socket.off(event);
};

export const emit = (event, data) => {
  socket.emit(event, data);
};

export const offListener = (event, fn) => {
  socket.off(event, fn)
}
