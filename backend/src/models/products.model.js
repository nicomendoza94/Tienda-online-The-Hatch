
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

//trae todos los productos guardados de products
async function findAll() {
  return getDB().collection('products')    //accede a la coleccion products
    .find()                   //busca todos los docs de la coleccion, devuelve un cursor(como una promesa, no un array concreto aun)
    .sort({ createdAt: -1 })   //ordena de manera descendente
    .toArray();    //aca si se ejecuta y trae el array real
}

//Busca un solo producto por su id
async function findById(id) {
  return getDB().collection('products').findOne({ _id: new ObjectId(id) });
}

//inserta un producto nuevo
async function create(productData) {
  return getDB().collection('products').insertOne(productData);
}

//actualiza un producto existente  por su id
async function updateById(id, updateData) {
  return getDB().collection('products').updateOne(
    { _id: new ObjectId(id) },  //a cual documento aplicar el cambio y el segundo que cambio aplicarle exactamente
    { $set: updateData }    //set actaliza los campos puntuales que se modifican
  );
}

//elimina productos por el id
async function deleteById(id) {
  return getDB().collection('products').deleteOne({ _id: new ObjectId(id) });
}

module.exports = { findAll, findById, create, updateById, deleteById };