import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import RouterUsers from "./src/Routes/UserRoutes.js";
import LoginUser from "./src/Routes/LoginRouters.js";
import formularios from "./src/Routes/FormularioRouter.js";
import estadisticas from "./src/Routes/EstadisticasRouter.js";
import soporte from "./src/Routes/SoporteRouter.js";
import path from "path";


import { fileURLToPath } from "url";
import { dirname } from "path";

// ✅ Esto corrige __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const VolarixCapital = express()
const PORT = process.env.PORT;



dotenv.config()



VolarixCapital.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
VolarixCapital.use(express.json())
VolarixCapital.use("/uploads", express.static(path.join(__dirname, "uploads")));


VolarixCapital.use('/users', RouterUsers)
VolarixCapital.use('/form', formularios)
VolarixCapital.use('/estadisticas', estadisticas)
VolarixCapital.use('/soport',soporte)
VolarixCapital.use(LoginUser)

VolarixCapital.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});
VolarixCapital.get("/test", (req, res) => {
  res.json({ mensaje: "GET funciona" });
});

VolarixCapital.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
