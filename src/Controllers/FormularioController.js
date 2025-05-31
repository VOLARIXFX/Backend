import { conexion } from "../Database/conexion.js";
import path from 'path'
import moment from 'moment-timezone';

export const PostFormulario = async(req, res) => {
    try {
        const id_usuario = req.params.id_usuario
        const { tipo_operacion, divisa_operada, precio_apertura, profit, stop_loss, take_profit, hora_apertura, hora_cierre, resultado, notas, timezone } = req.body

        const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const fecha_post = moment().tz(userTimezone).format("YYYY-MM-DD HH:mm:ss");

        let imagen = null
        if(req.file){
            imagen = req.file.filename
        }
      
        await conexion.query(
            'insert into formulario (id_usuario, tipo_operacion, divisa_operada, precio_apertura, profit, stop_loss, take_profit, hora_apertura, hora_cierre, resultado, fecha_post, notas, imagen) values (?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [id_usuario, tipo_operacion, divisa_operada, precio_apertura, profit, stop_loss, take_profit, hora_apertura, hora_cierre, resultado, fecha_post, notas, imagen]
        );

        res.status(200).json({ message: "Formulario enviado exitosamente" });
    } catch (error) {
        console.error("❌ Error en servidor:", error);
        res.status(500).json({ message: "Error en el servidor: " + error });
    }
}; 

export const GetFormulario = async(req, res) => {
    try {

        const formulario = await conexion.query('select * from formulario') 
        res.status(200).json(formulario[0])

    } catch (error) {
        res.status(500).json({message: "error en el servidor" + error})
    }
}

    export const GetFormularioXFecha = async(req,res) => {
        try {
            const {fecha_post} = req.query
            
            if(!fecha_post) {
                return res.status(400).json({message: "Por favor ingresa una fechaaaaaaaa"})
            }

            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/
            if (!fechaRegex.test(fecha_post)) {
                return res.status(400).json({
                    message: "Formato de fecha inválido. Use el formato YYYY-MM-DD",
                    ejemplo: "2024-03-21"
                })
            }

            const filtroFecha = await conexion.query('select * from formulario where DATE(fecha_post) = ?', [fecha_post])
            
            if(filtroFecha[0].length === 0){
                return res.status(404).json({
                    message: "No hay resultados para la fecha solicitada",
                    fecha_buscada: fecha_post
                })
            }

            return res.status(200).json(filtroFecha[0])
        } catch (error) {
            console.error("Error en GetFormularioXFecha:", error)
            return res.status(500).json({
                message: "Error en el servidor",
                error: error.message
            })
        }
    }
