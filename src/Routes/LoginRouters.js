import { Router } from "express";
import { ActualizarToken, Login } from "../Controllers/LoginController.js";


const LoginUser = Router()

LoginUser.post('/login', Login)
LoginUser.patch('/tokennotificacion/:id_user', ActualizarToken)

export default LoginUser;