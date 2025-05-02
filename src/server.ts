import app from "./app";
import dotenv from "dotenv";
import sequelize, { testConnection, syncModels } from "./config/database";

// Load environment variables
dotenv.config();

// Set port
const port = process.env.PORT || 5000;

// Sync database models and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync all models with database
    // Temporarily enabled for all environments
    await syncModels();
    // TODO: Change back to only sync in development later
    // await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    // console.log('Database synced successfully');

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Start the server
startServer();
