import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import crypto from "crypto";

//definimos esquema de GRAPHQL
const schema = buildSchema(`
  type Producto {
    id: ID!
    title: String,
    price: Int,
    thumbnail: String
  }
  input ProductoInput {
    title: String,
    price: Int,
    thumbnail: String
  }
  type Query {
    getProducto(id: ID!): Producto,
    getProductos(campo: String, valor: String): [Producto],
  }
  type Mutation {
    createProducto(datos: ProductoInput): Producto
    updateProducto(id: ID!, datos: ProductoInput): Producto,
    deleteProducto(id: ID!): Producto,
  }
`);

class Producto {
  constructor(id, { title, price, thumbnail }) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.thumbnail = thumbnail;
  }
}

const app = express();

//insertamos motor graphgl como middleware
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: {
      getProductos,
      getProducto,
      createProducto,
      updateProducto,
      deleteProducto,
    },
    graphiql: true,
  })
);

const PORT = 8080;
app.listen(PORT, () => {
  const msg = `Servidor corriendo en puerto: ${PORT}`;
  console.log(msg);
});

const productosMap = {};

function getProductos({ campo, valor }) {
  const productos = Object.values(productosMap);
  if (campo && valor) {
    return productos.filter((p) => p[campo] == valor);
  } else {
    return productos;
  }
}

function getProducto({ id }) {
  if (!productosMap[id]) {
    throw new Error("Producto no encontrado.");
  }
  return productosMap[id];
}

function createProducto({ datos }) {
  const id = crypto.randomBytes(10).toString("hex");
  const nuevoProducto = new Producto(id, datos);
  productosMap[id] = nuevoProducto;
  return nuevoProducto;
}

function updateProducto({ id, datos }) {
  if (!productosMap[id]) {
    throw new Error("Producto no encontrado");
  }
  const productoActualizado = new Producto(id, datos);
  productosMap[id] = productoActualizado;
  return productoActualizado;
}

function deleteProducto({ id }) {
  if (!productosMap[id]) {
    throw new Error("Producto no encontrado");
  }
  const productoEliminado = productosMap[id];
  delete productosMap[id];
  return productoEliminado;
}
