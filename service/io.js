let io;
const { Server } = require("socket.io");

module.exports = {
  init: (serve) => {
    io = new Server(serve, {
      cors: {
        origin: "https://kosmos-lif.host",
        methods: ["GET", "POST"],
      },
    });
    return io;
  },
  get: () => {
    if (!io) {
      throw new Error("socket is not initialized");
    }
    return io;
  }
};