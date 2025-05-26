import { Router } from "express";
import {  ActualizarContraseñaIDashboard, ActualizarInformacion, cambiarContraseñaIndex, CambiarEstado, CrearUsuario, estadisticaUsuarios,  getFormulariosDelDia,  getUltiFormularioAdmin, ObtenerUsuarios, ObtenerUsuariosById, OlvidoContrasena, usuariosActivos, usuariosDelMes, usuariosInactivosSemana } from "../Controllers/UsersController.js";
import { ValidarToken, VerificarRol } from "../Controllers/LoginController.js";
import { upload } from "../../Multer.js";

const RouterUsers = Router()

RouterUsers.post('/register', ValidarToken, VerificarRol(['administrador']), upload.single('imagen'), CrearUsuario)
RouterUsers.get('/obtener', ValidarToken, VerificarRol(['administrador']), ObtenerUsuarios)
RouterUsers.get('/obtenerperfil/:id_user', ValidarToken, VerificarRol(['administrador','cliente']), ObtenerUsuariosById)
RouterUsers.patch('/contrasenaDash', ValidarToken, VerificarRol(['administrador', 'cliente']), ActualizarContraseñaIDashboard)
RouterUsers.post('/password', OlvidoContrasena) 
RouterUsers.patch('/passwordGmail', cambiarContraseñaIndex)
RouterUsers.patch('/infoUser/:id_user', ValidarToken, VerificarRol(['administrador', 'cliente']), upload.single('imagen'), ActualizarInformacion)
RouterUsers.patch('/estadoUser/:id_user', ValidarToken, VerificarRol(['administrador']), CambiarEstado)
RouterUsers.get('/totalusuarios', ValidarToken, VerificarRol(['administrador']), estadisticaUsuarios)
RouterUsers.get('/ultimopostadmin/:id_user', ValidarToken, VerificarRol(['administrador']), getUltiFormularioAdmin)
RouterUsers.get('/ultimospost',   getFormulariosDelDia)
RouterUsers.get('/usuariosDelMes', ValidarToken, VerificarRol(['administrador']), usuariosDelMes)
RouterUsers.get('/usuariosActivos', ValidarToken, VerificarRol(['administrador']), usuariosActivos)
RouterUsers.get('/inactivosSemana', ValidarToken, VerificarRol(['administrador']), usuariosInactivosSemana)

export default RouterUsers