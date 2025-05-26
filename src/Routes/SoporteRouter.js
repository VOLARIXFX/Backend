import { Router } from "express";
import { EnviarSoporte } from "../Controllers/SoporteController.js";


const soporte = Router()

soporte.post('/soporte-admin', EnviarSoporte )

export default soporte