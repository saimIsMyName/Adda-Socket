require("dotenv").config();
const app = require("express")();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Server is ready for ADDA !");
});

const server = app.listen(
  PORT,
  console.log(`Server Running on PORT ${PORT}...`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.ORIGIN
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
    console.log("socket connected");
  });

  socket.on("join chat", (room) => {
    console.log("join chat", room);
    socket.join(room);
  });

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
      console.log("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    socket.leave(userData._id);
    console.log("socket disconnected");
  });
});
