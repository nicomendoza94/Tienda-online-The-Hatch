//se instala el el driver nativo de mongodb
const { MongoClient } = require('mongodb');

//lee el archivo .env
require('dotenv').config();

//direccion para que el servidor se conecte a la base de datos
const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('MONGO_URI is not defined in .env file');
}
//se crea una instancia del objeto
const client = new MongoClient(uri);

//referencia a la conex ya abierta con la bd
let db;

//funcion para realizar la conex a la bd
async function connectDB() {
  //verifica si db ya tiene un valor asignado
  if (db) return db;

  try {
    await client.connect();
    db = client.db(); // usa el nombre de base de datos que viene en la URI (larry_pinguino)
    console.log('✅ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);   //para terminar el programa completo el proceso de Node, para no arrancar el prog sin bd
  }
}
//funcion para obtener la base de datos para el resto del programa
function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

module.exports = { connectDB, getDB };