import { conexion } from "../Database/conexion.js";
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import path from 'path'

export const CrearUsuario = async(req,res) => {
  try {
    const {Nombres, rol, Apellidos, Correo, Cuenta_conectada, telefono, pais, password, descripcion} = req.body
    const estado = 'activo'
    const fecha_registro = new Date().toISOString().split('T')[0]
    
    // Manejo de la imagen
    let imagen = null;
    if (req.file) {
      imagen = req.file.filename;
    }

    const [usuariosConMismoCorreo] = await conexion.query('select * from usuarios where Correo = ?', [Correo])
    if (usuariosConMismoCorreo.length > 0) {
      return res.status(400).json({message: 'Ya existe un usuario con ese correo electrónico'})
    }

    const [usuariosConMismoNombre] = await conexion.query('select * from usuarios where Nombres = ? and Apellidos = ?', [Nombres, Apellidos])
    if (usuariosConMismoNombre.length > 0) {
      return res.status(400).json({message: 'Ya existe un usuario con ese nombre y apellido'})
    }

    const salt = await bcrypt.genSalt(10)
    const contraEncryptada = await bcrypt.hash(password, salt)

    await conexion.query('insert into usuarios (Nombres, rol, Apellidos, Correo, Cuenta_conectada, telefono, pais, password, descripcion, estado, imagen, fecha_registro) values (?,?,?,?,?,?,?,?,?,?,?,?)',
    [Nombres, rol, Apellidos, Correo, Cuenta_conectada, telefono, pais, contraEncryptada, descripcion, estado, imagen, fecha_registro])
    
    res.status(200).json({message: 'Usuario registrado correctamente'})

  } catch (error) {
    res.status(500).json({message: "error en el servidor" + error})
  }
}


export const ObtenerUsuarios = async(req,res) => {
  try {
    const usuarios = await conexion.query('select * from usuarios')
    res.status(200).json(usuarios[0])
    
  } catch (error) {
    res.status(500).json({message: "error en el servidor" + error})
  }
}
export const ObtenerUsuariosById = async(req,res) => {
  try {
    const id_user = req.params.id_user
    const [usuarios] = await conexion.query('select * from usuarios where id_user = ?', [id_user])
    res.status(200).json(usuarios[0])
    
  } catch (error) {
    res.status(500).json({message: "error en el servidor" + error})
  }
}

export const ActualizarInformacion = async(req,res) => {
  try {
    const id_user = req.params.id_user
    const {Nombres, Apellidos, Correo, Cuenta_conectada, telefono, pais, descripcion} = req.body

    // Primero obtenemos la imagen actual del usuario
    const [usuarioActual] = await conexion.query(
      'SELECT imagen FROM usuarios WHERE id_user = ?',
      [id_user]
    );

    // Mantenemos la imagen actual si no se envía una nueva
    let imagen = usuarioActual[0]?.imagen;
    if (req.file) {
      imagen = req.file.filename;
    }

    await conexion.query(
      'UPDATE usuarios SET Nombres = ?, Apellidos = ?, Correo = ?, Cuenta_conectada = ?, telefono = ?, pais = ?, descripcion = ?, imagen = ? WHERE id_user = ?',
      [Nombres, Apellidos, Correo, Cuenta_conectada, telefono, pais, descripcion, imagen, id_user]
    );
    
    res.status(200).json({message: "Usuario actualizado correctamente"})

  } catch (error) {
    console.error("Error en ActualizarInformacion:", error);
    res.status(500).json({message: "Error en el servidor: " + error.message})
  }
}

export const CambiarEstado = async(req,res) => {
  try {

    const id_user = req.params.id_user
    const {estado} = req.body

    await conexion.query('update usuarios set estado = ? where id_user = ?',[estado, id_user])
    res.status(200).json({message: "estado actualizado con exito"})

    
  } catch (error) {
    res.status(500).json({message: "error en el servidor" + error})
  }
}


export const ActualizarContraseñaIDashboard = async(req, res) => {
  try {
    const { passwordAntigua, passwordNueva, confirmarPassword } = req.body;
    const userId = req.user.id_user; 

    if (!passwordAntigua || !passwordNueva || !confirmarPassword) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (passwordNueva !== confirmarPassword) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    const [usuario] = await conexion.query('SELECT * FROM usuarios WHERE id_user = ?', [userId]);
    if (usuario.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordMatch = await bcrypt.compare(passwordAntigua, usuario[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña antigua incorrecta' });
    }

    const salt = await bcrypt.genSalt(10);
    const contraEncryptada = await bcrypt.hash(passwordNueva, salt);

    await conexion.query('UPDATE usuarios SET password = ? WHERE id_user = ?', [contraEncryptada, userId]);
    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor: " + error });
  }
};

export const OlvidoContrasena = async(req,res) => {
  try {
    const {Correo} = req.body

    const [rows] = await conexion.query('select * from usuarios where Correo = ?', [Correo]);

    if (!rows || rows.length === 0) {
      return res.status(400).json({message: "usuario no encontrado"});
    }

    const usuario = rows[0];

    const tokenRecuperacion = jwt.sign({id_user: usuario.id_user}, process.env.JWT_SECRET_RECUPERACION , {expiresIn: '1h'})

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Correo,
      subject: 'Recuperación de contraseña',
      text: `Hola ${usuario.Nombres} Haga clic en este enlace para recuperar tu contraseña: http://localhost:5173/changepass/${tokenRecuperacion}`
    }

    await transporter.sendMail(mailOptions)
    res.status(200).json({message:"enlace de recuperacion enviada"})

  } catch (error) {
    res.status(500).json({message: "error en el servidor " + error})
  }
}
export const cambiarContraseñaIndex = async (req, res) => {
  const { token, passwordNueva, confirmarPassword } = req.body;

  try {
    if (passwordNueva !== confirmarPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_RECUPERACION);
    const { id_user } = decoded;

    const [rows] = await conexion.query('SELECT * FROM usuarios WHERE id_user = ?', [id_user]);
    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncryptada = await bcrypt.hash(passwordNueva, salt);

    const [result] = await conexion.query('UPDATE usuarios SET password = ? WHERE id_user = ?', [passwordEncryptada, id_user]);
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No se pudo actualizar la contraseña" });
    }

    res.status(200).json({ message: "Contraseña cambiada con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const estadisticaUsuarios = async(req, res) => {
  try {
    
    const totalusuarios = await conexion.query('select count(*) as total from usuarios')
    res.status(200).json(totalusuarios[0])


  } catch (error) {
    res.status(500).json({message: "error en el servidor" + error})
  }
}

export const getUltiFormularioAdmin = async(req, res) => {
  try {
    const id_user = req.params.id_user;

    const [formulario] = await conexion.query(`
      SELECT *, 
             TIMESTAMPDIFF(HOUR, fecha_post, NOW()) as horas_transcurridas
      FROM formulario
      WHERE id_usuario = ?
      ORDER BY id_operacion DESC
      LIMIT 1
    `, [id_user]);

    res.status(200).json(formulario[0] || null);

  } catch (error) {
    res.status(500).json({message: "error en el servidor" + error});
  }
}
export const getFormulariosDelDia = async (req, res) => {
  try {
    const [formularios] = await conexion.query(`
      SELECT *, 
             TIMESTAMPDIFF(HOUR, fecha_post, NOW()) as horas_transcurridas
      FROM formulario
      WHERE TIMESTAMPDIFF(HOUR, fecha_post, NOW()) <= 12
      ORDER BY id_operacion DESC
      LIMIT 10
    `);

    const [totalOperaciones] = await conexion.query(`
      SELECT COUNT(*) as total 
      FROM formulario 
      WHERE TIMESTAMPDIFF(HOUR, fecha_post, NOW()) <= 12
    `);

    res.status(200).json({
      formularios,
      totalOperaciones: totalOperaciones[0].total,
      limiteAlcanzado: totalOperaciones[0].total >= 4
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener los formularios del día', 
      error: error.message 
    });
  }
};

export const usuariosDelMes = async(req,res) => {
  try {
    
    const [usuarios] = await conexion.query('select count(*) as total from usuarios where fecha_registro between curdate() and date_add(curdate(), interval 1 month) and estado = "activo"')
    res.status(200).json(usuarios[0])

  } catch (error) {
    res.status(500).json({message: "error en el servidor" + error})
  }
}

export const usuariosActivos = async(req,res) => {
  try {
    const [usuarios] = await conexion.query('select count(*) as total from usuarios where estado = "activo"')
    res.status(200).json(usuarios[0])
    
  } catch (error) {
    res.status(500).json({message: "error en el servidor" + error})
  }
}
export const usuariosInactivosSemana = async(req,res) => {
  try {
    const fechaActual = new Date();
    const fechaInicioSemana = new Date(fechaActual);
    fechaInicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay() + 1);
    const fechaFinSemana = new Date(fechaActual);
    fechaFinSemana.setDate(fechaActual.getDate() - fechaActual.getDay() + 7);

    const [resultado] = await conexion.query(
      'SELECT COUNT(*) AS total FROM usuarios WHERE estado = "inactivo" AND fecha_registro BETWEEN ? AND ?',
      [fechaInicioSemana.toISOString().slice(0, 19).replace('T', ' '), fechaFinSemana.toISOString().slice(0, 19).replace('T', ' ')]
    );
    res.status(200).json({ total: resultado[0].total });
  } catch (error) {
    res.status(500).json({message: "error en el servidor" + error})
  }
}