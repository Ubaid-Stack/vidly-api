import mongoose from "mongoose"

const connectDB = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default connectDB;