import { createPool } from "mysql2/promise"

import dotenv from "dotenv"
dotenv.config({path: '.env'})
console.log(process.env.DB_USER, process.env.DB_PASS, process.env.DB_HOST, process.env.DB_PORT)

export const conexion = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS


})

conexion.query('SELECT 1')
  .then(() => console.log('Base de datos conectada'))
  .catch(err => console.error('Error al conectar BD:', err))

  // pequeña validacion para asegurar si la base de datos esta bien
  // conectada con el servidor