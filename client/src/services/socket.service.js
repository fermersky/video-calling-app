const socket = io('http://localhost:3000');

export const on = (event, fn) => {
  socket.on(event, fn);
};

export const emit = (event, data) => {
  socket.emit(event, data);
};
