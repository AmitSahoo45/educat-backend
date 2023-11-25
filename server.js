const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const socketServer = require("./socketServer");
const authRoutes = require("./routes/authRoutes");
const friendInvitationRoutes = require("./routes/friendInvitationRoutes");
const quizRoutes = require("./routes/Quiz");

const PORT = process.env.PORT || process.env.API_PORT;

const app = express();
app.use(express.json());

const corsOptions = {
  origin: ['https://studentaze.vercel.app', 'http://localhost:3000'],
  credentials: true,
  optionSuccessStatus: 200
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hello from Eduq API');
});

// register the routes
app.use("/api/auth", authRoutes);
app.use("/api/friend-invitation", friendInvitationRoutes);
app.use("/api/quiz", quizRoutes);

const server = http.createServer(app);
socketServer.registerSocketServer(server);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("database connection failed. Server not started");
    console.error(err);
  });
