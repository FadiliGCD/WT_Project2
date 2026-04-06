const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const authRoutes = require("./routes/auth.routes");
const recipesRoutes = require("./routes/recipes.routes");
const mealplanRoutes = require("./routes/mealplan.routes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health test route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server running" });
});

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/mealplan", mealplanRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });