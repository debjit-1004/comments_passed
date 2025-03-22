import mongoose from 'mongoose';

type ConnectionObject = {
  //returned is optional so ? but if returned it is number 
  isConnected?: number;
};

//connection is a object of type ConnectionObject
const connection: ConnectionObject = {};

//check for promise<void> type
//void means we dont care abt which type of data is returned
async function dbConnect(): Promise<void> {
  // Check if we have a connection to the database or if it's currently connecting
  if (connection.isConnected) {
    console.log('Already connected to the database');
    return;
  }

  try {
    // Attempt to connect to the database
    //STUDY MONGOOSE WHAT MORE OBJECT CAN BE SEND IN MONGOOSE.CONNECT
    const db = await mongoose.connect(process.env.MONGODB_URI || '', {});

    
    connection.isConnected = db.connections[0].readyState;

    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);

    // Graceful exit in case of a connection error
    process.exit(1);
  }
}

export default dbConnect;