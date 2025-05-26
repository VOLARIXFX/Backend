import { conexion } from "../Database/conexion.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export const Login = async(req,res) => {
    try {
        const {Correo, password} = req.body
        const [usuario] = await conexion.query('select * from usuarios where Correo = ?', [Correo])

        if(usuario.length === 0){
            return res.status(404).json({message: 'usuario no encontrado'})
        }

        const user = usuario[0]

        // Validar estado
        if(user.estado === 'inactivo'){
            return res.status(403).json({message: 'Usuario inactivo, acceso denegado'})
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if(!passwordMatch){
            return res.status(401).json({message: 'contraseña incorrecta'})
        }

        const token = jwt.sign({
            id_user: user.id_user,
            rol: user.rol,
            nombre: user.Nombres,
            photo: user.imagen
        }, process.env.SECRET, {expiresIn: process.env.TIME})

        res.status(200).json({
            token,
            id: user.id_user,
            nombre: user.Nombres,
            rol: user.rol,
            photo: user.imagen
        })

    } catch (error) {
        res.status(500).json({message: "error en el servidor"+ error})
    }
}




export const ActualizarToken = async(req,res) => {
    try {
       
        const { id_user } = req.params.id_user
        const { fcm_token } = req.body;
    
        await conexion.query(
          'UPDATE usuarios SET fcm_token = ? WHERE id = ?',
          [fcm_token, id_user]
        );
    
        res.status(200).json({ message: "Token actualizado correctamente" });

    } catch (error) {
        res.status(500).json({message: "error en el servidor "+ error})
    }
}




export const ValidarToken = async(req, res, next) => {
    try {
        const header = req.headers['authorization']
        if(!header) {
            return res.status(401).json({message: "se requiere un token"})
        }
        
        const token = header.split(' ')[1]
        if(!token) {
            return res.status(401).json({message: "Formato de token invalido"})
        }

        jwt.verify(token, process.env.SECRET, async (error, decoded) => {
            if(error){
                return res.status(404).json({message: "Token invalido o expirado"})
            }
            // Consultar usuario y validar estado
            const [usuarios] = await conexion.query('SELECT estado FROM usuarios WHERE id_user = ?', [decoded.id_user]);
            if (!usuarios || usuarios.length === 0) {
                return res.status(404).json({message: "Usuario no encontrado"});
            }
            if (usuarios[0].estado === 'inactivo') {
                return res.status(403).json({message: "Usuario inactivo, acceso denegado"});
            }
            req.user = decoded
            next()
        })

    } catch (error) {
        res.status(500).json({message: "error en el servidor" + error})
    }
}

export const VerificarRol = (rolesPermitidos) => {
   return (req, res, next) => {
    if(!req.user) {
        res.status(401).json({message: "usuario no encontrado"})
    }
    const {rol} = req.user
    if(typeof rol === 'undefined'){
        res.status(400).json({message: "rol no encontrado"})
    }
    if(!rolesPermitidos.includes(rol)){
        res.status(500).json({message: "Acceso denegado, no estas autorizado para esta accion"})
    }
    next()
   }
}