import { Router } from "express";
import { GetFormulario, GetFormularioXFecha, PostFormulario } from "../Controllers/FormularioController.js";
import { ValidarToken, VerificarRol } from "../Controllers/LoginController.js";
import { upload } from "../../Multer.js";



const formularios = Router()

formularios.post('/enviar/:id_usuario', ValidarToken, VerificarRol(['administrador']), upload.single('imagen'), PostFormulario)
formularios.get('/obtener-todo', GetFormulario)
formularios.get('/obtener-filtro',  GetFormularioXFecha)
export default formularios