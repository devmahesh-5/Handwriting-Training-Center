import mongoose from 'mongoose';


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection;
    db.on('error', ()=>console.error('MongoDB connection error:'));

    db.on('connected', () => {
      console.log('MongoDB connected successfully.connection host:', db.host);
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectDB;