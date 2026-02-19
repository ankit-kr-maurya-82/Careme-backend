import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

let cachedConnection = null;
let pendingConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;
  if (pendingConnection) return pendingConnection;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in environment");
  }

  pendingConnection = mongoose
    .connect(process.env.MONGODB_URI)
    .then((connectionInstance) => {
      cachedConnection = connectionInstance;
      console.log(`MongoDB connected. DB HOST: ${connectionInstance.connection.host}`);
      return connectionInstance;
    })
    .catch((error) => {
      pendingConnection = null;
      throw error;
    });

  return pendingConnection;
};

export default connectDB;
