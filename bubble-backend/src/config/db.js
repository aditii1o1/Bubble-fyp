import mongoose from "mongoose";

async function connectDb() {
  const defaultUri = "mongodb://127.0.0.1:27017/bubble";
  const uri = (process.env.MONGODB_URI || "").trim() || defaultUri;

  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not set; using local MongoDB:", uri);
    console.warn("Tip: create `bubble-backend/.env` from `.env.example` if needed.");
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected:", uri === defaultUri ? "local" : "custom");
}

export { connectDb };
