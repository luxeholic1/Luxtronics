import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log('❌ MONGODB_URI not found in environment');
  process.exit(1);
}

console.log('🔗 Testing connection to MongoDB Atlas...');
console.log('📋 URI starts with:', uri.substring(0, 30) + '...');

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true, // Temporary workaround
  tlsAllowInvalidHostnames: true,    // Temporary workaround
  retryWrites: true,
  w: 'majority'
});

try {
  await client.connect();
  console.log('✅ MongoDB client connected successfully');

  await client.db('admin').command({ ping: 1 });
  console.log('✅ Ping successful - MongoDB is accessible');

  client.close();
  process.exit(0);
} catch (err) {
  console.error('❌ Connection failed:', err.message);
  console.error('🔍 Error code:', err.code);
  console.error('🔍 Error name:', err.name);
  client.close();
  process.exit(1);
}