import nodemailer from 'nodemailer'; 

export const EnviarSoporte = async(req,res) => {
    try {
        const { nombre, email, mensaje } = req.body;

        if (!nombre || !email || !mensaje) {
            return res.status(400).json({ message: "Por favor, completa todos los campos." });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com', 
            port: 587,
            secure: false, 
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASSWORD 
            },
            tls: { 
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, 
            to: process.env.ADMIN_EMAIL, 
            subject: `Mensaje de soporte de ${nombre} - ${email}`, 
            text: `De: ${nombre}\nCorreo: ${email}\nMensaje:\n${mensaje}` 
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Mensaje enviado con éxito. Te responderemos pronto." });
        
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al enviar el mensaje." + error });
    }
}