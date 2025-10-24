import mongoose from "mongoose";


export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.COSMOS_MONGO_URL, {
      tls: true,
      retryWrites: false,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected to Azure Cosmos DB (Mongo API)");
  } catch (err) {
    console.error("❌ Failed to connect Cosmos DB:", err.message);
    process.exit(1);
  }
};
