import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db";
import exerciseRoutes from "./routes/exerciseRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/exercises", exerciseRoutes);
app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  console.log("Root route accessed");
  res.send("Welcome to the Exercise Manager Backend!");
});

// Testing Database Connection
sequelize
  .sync()
  .then(() => {
    console.log("Database connected and models synced.");
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
