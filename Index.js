import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import RouterUsers from "./src/Routes/UserRoutes.js";
import LoginUser from "./src/Routes/LoginRouters.js";
import formularios from "./src/Routes/FormularioRouter.js";
import estadisticas from "./src/Routes/EstadisticasRouter.js";
import soporte from "./src/Routes/SoporteRouter.js";
const VolarixCapital = express()
const PORT = process.env.PORT;



dotenv.config()



VolarixCapital.use(cors())
VolarixCapital.use(express.json())


VolarixCapital.use('/uploads', express.static('uploads'))
VolarixCapital.use('/users', RouterUsers)
VolarixCapital.use('/form', formularios)
VolarixCapital.use('/estadisticas', estadisticas)
VolarixCapital.use('/soport',soporte)
VolarixCapital.use(LoginUser)

VolarixCapital.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

VolarixCapital.listen(PORT, ()=>{
    console.log(`Servidor corriendo ${PORT}`);
})

