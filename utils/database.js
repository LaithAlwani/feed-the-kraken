import mongoose from 'mongoose';

let isConnected = false; // track the connection

const connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if(isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "feed_the_kraken",
    })

    isConnected = true;

    console.log('MongoDB connected')
  } catch (error) {
    throw new Error("Error in Connecting to Database"+ error);
  }
}

export default connectToDB;