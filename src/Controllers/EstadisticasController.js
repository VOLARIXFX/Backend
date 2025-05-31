import { conexion } from "../Database/conexion.js";

const calcularFechasPeriodo = (tipo_periodo, fecha_referencia = new Date(), periodo_anterior = false) => {
    let fecha_fin = new Date(fecha_referencia);
    let fecha_inicio = new Date(fecha_referencia);

    switch(tipo_periodo) {
        case 'diario':
            fecha_inicio.setHours(0, 0, 0, 0);
            fecha_fin.setHours(23, 59, 59, 999);
            break;
        case 'semanal':
            // Ajustar al inicio de la semana (lunes) de la fecha de referencia
            const diaSemana = fecha_inicio.getDay();
            const diasAjuste = diaSemana === 0 ? -6 : 1 - diaSemana;
            fecha_inicio.setDate(fecha_inicio.getDate() + diasAjuste);
            fecha_inicio.setHours(0, 0, 0, 0);
            
            // La fecha fin es 4 días después de la fecha inicio ajustada (solo hasta el viernes)
            fecha_fin = new Date(fecha_inicio);
            fecha_fin.setDate(fecha_inicio.getDate() + 4);
            fecha_fin.setHours(23, 59, 59, 999);

            // Si se pide el período anterior, ajustamos ambas fechas una semana atrás
            if (periodo_anterior) {
                fecha_inicio.setDate(fecha_inicio.getDate() - 7);
                fecha_fin.setDate(fecha_fin.getDate() - 7);
            }
            break;
        case 'mensual':
            // Si hay fecha_referencia y no se pide el período anterior, usamos el mes de la fecha de referencia
            if (fecha_referencia && !periodo_anterior) {
                fecha_inicio = new Date(fecha_referencia.getFullYear(), fecha_referencia.getMonth(), 1);
                fecha_fin = new Date(fecha_referencia.getFullYear(), fecha_referencia.getMonth() + 1, 0);
            } else if (periodo_anterior) {
                 // Si se pide el período anterior, calculamos el mes anterior al de la fecha de referencia
                fecha_inicio = new Date(fecha_referencia.getFullYear(), fecha_referencia.getMonth() - 1, 1);
                fecha_fin = new Date(fecha_referencia.getFullYear(), fecha_referencia.getMonth(), 0);
            } else { // Si no hay fecha_referencia ni periodo_anterior, usamos el mes actual
                 fecha_inicio = new Date(fecha_referencia.getFullYear(), fecha_referencia.getMonth(), 1);
                 fecha_fin = new Date(fecha_referencia.getFullYear(), fecha_referencia.getMonth() + 1, 0);
            }
            fecha_inicio.setHours(0, 0, 0, 0);
            fecha_fin.setHours(23, 59, 59, 999);
            break;
        case 'semestral':
             // Si hay fecha_referencia y no se pide período anterior, usamos el semestre de la fecha de referencia
             if (fecha_referencia && !periodo_anterior) {
                 const semestre = Math.floor(fecha_referencia.getMonth() / 6);
                 fecha_inicio = new Date(fecha_referencia.getFullYear(), semestre * 6, 1);
                 fecha_fin = new Date(fecha_referencia.getFullYear(), semestre * 6 + 6, 0);
             } else if (periodo_anterior) {
                 // Si se pide período anterior, calculamos el semestre anterior al de la fecha de referencia
                 const semestre = Math.floor(fecha_referencia.getMonth() / 6);
                 fecha_inicio = new Date(fecha_referencia.getFullYear(), semestre * 6 - 6, 1);
                 fecha_fin = new Date(fecha_referencia.getFullYear(), semestre * 6, 0);
             } else { // Si no hay fecha_referencia ni periodo_anterior, usamos el semestre actual
                 const semestre = Math.floor(fecha_referencia.getMonth() / 6);
                 fecha_inicio = new Date(fecha_referencia.getFullYear(), semestre * 6, 1);
                 fecha_fin = new Date(fecha_referencia.getFullYear(), semestre * 6 + 6, 0);
             }
             fecha_inicio.setHours(0, 0, 0, 0);
             fecha_fin.setHours(23, 59, 59, 999);
            break;
        case 'anual':
             // Si hay fecha_referencia y no se pide período anterior, usamos el año de la fecha de referencia
            if (fecha_referencia && !periodo_anterior) {
                 fecha_inicio = new Date(fecha_referencia.getFullYear(), 0, 1);
                 fecha_fin = new Date(fecha_referencia.getFullYear(), 11, 31);
            } else if (periodo_anterior) {
                 // Si se pide período anterior, calculamos el año anterior al de la fecha de referencia
                 fecha_inicio = new Date(fecha_referencia.getFullYear() - 1, 0, 1);
                 fecha_fin = new Date(fecha_referencia.getFullYear() - 1, 11, 31);
            } else { // Si no hay fecha_referencia ni periodo_anterior, usamos el año actual
                 fecha_inicio = new Date(fecha_referencia.getFullYear(), 0, 1);
                 fecha_fin = new Date(fecha_referencia.getFullYear(), 11, 31);
            }
            fecha_inicio.setHours(0, 0, 0, 0);
            fecha_fin.setHours(23, 59, 59, 999);
            break;
        case 'personalizado':
             // Para personalizado, las fechas ya vienen calculadas, solo ajustamos la hora
             // Aseguramos que fecha_referencia sea un objeto Date si se usó para calcular el rango
            if (!(fecha_inicio instanceof Date)) fecha_inicio = new Date(fecha_inicio);
            if (!(fecha_fin instanceof Date)) fecha_fin = new Date(fecha_fin);
            fecha_inicio.setHours(0, 0, 0, 0);
            fecha_fin.setHours(23, 59, 59, 999);
            break;
        default:
            throw new Error('Tipo de período no válido');
    }

    return {
        fecha_inicio: `${fecha_inicio.getFullYear()}-${String(fecha_inicio.getMonth() + 1).padStart(2, '0')}-${String(fecha_inicio.getDate()).padStart(2, '0')} ${String(fecha_inicio.getHours()).padStart(2, '0')}:${String(fecha_inicio.getMinutes()).padStart(2, '0')}:${String(fecha_inicio.getSeconds()).padStart(2, '0')}`,
        fecha_fin: `${fecha_fin.getFullYear()}-${String(fecha_fin.getMonth() + 1).padStart(2, '0')}-${String(fecha_fin.getDate()).padStart(2, '0')} ${String(fecha_fin.getHours()).padStart(2, '0')}:${String(fecha_fin.getMinutes()).padStart(2, '0')}:${String(fecha_fin.getSeconds()).padStart(2, '0')}`
    };
};

const calcularEstadisticasPeriodo = async (tipo_periodo, fecha_inicio, fecha_fin) => {
    console.log('Calculando estadísticas para:', { tipo_periodo, fecha_inicio, fecha_fin });

    const CAPITAL_INICIAL = 1000; 

    const [operaciones] = await conexion.query(
        'SELECT * FROM formulario WHERE fecha_post BETWEEN ? AND ? AND id_usuario = ?',
        [fecha_inicio, fecha_fin, 2]
    );

    console.log('Operaciones crudas:', operaciones);

    const operaciones_totales = operaciones.length;
    
    // Asegurar que el profit sea un número válido para los cálculos
    const operacionesValidas = operaciones.map(op => ({
        ...op,
        profit: parseFloat(op.profit) || 0 // <-- ¿op.profit existe realmente?
    }));

    console.log('Operaciones válidas:', operacionesValidas);

    // Contar operaciones ganadoras y perdedoras basado en el campo 'profit' válido
    const operaciones_ganadoras = operacionesValidas.filter(op => op.profit > 0).length;
    const operaciones_perdedoras = operacionesValidas.filter(op => op.profit < 0).length;
    const win_rate = operaciones_totales > 0 ? (operaciones_ganadoras / operaciones_totales) * 100 : 0;

    // Calcular rentabilidad
    let rentabilidad_total = 0; // Usamos una variable diferente para la suma total de profits
    let ganancias = []; // Ganancias individuales (profit > 0)
    let perdidas = []; // Pérdidas individuales (profit < 0)

    operacionesValidas.forEach(op => {
        const resultado = op.profit;
        
        if (resultado > 0) {
            ganancias.push(resultado);
        } else if (resultado < 0) {
            // Guardar el valor absoluto de la pérdida
            perdidas.push(Math.abs(resultado));
        }
        rentabilidad_total += resultado; // Sumar el profit total
    });

    // Calcular la rentabilidad porcentual al final
    const rentabilidad = (rentabilidad_total / CAPITAL_INICIAL) * 100;

    const promedio_ganancia = ganancias.length > 0 ? 
        ganancias.reduce((a, b) => a + b, 0) / ganancias.length : 0;
    const promedio_perdida = perdidas.length > 0 ? 
        perdidas.reduce((a, b) => a + b, 0) / perdidas.length : 0;

    const rr_ratio = (promedio_perdida > 0) ? (promedio_ganancia / promedio_perdida) : 0;

    // Calcular balance y drawdown
    let balance = 0;
    let max_balance = 0;
    let drawdown_max = 0;
    let drawdown_pct = 0;

    operacionesValidas.forEach(op => {
        const resultado = op.profit;
        balance += resultado;
        if (balance > max_balance) {
            max_balance = balance;
        }
        const drawdown = max_balance - balance;
        if (drawdown > drawdown_max) {
            drawdown_max = drawdown;
        }
        // Calcular drawdown_pct dentro del bucle para el máximo porcentaje
         const current_drawdown_pct = max_balance > 0 ? (drawdown / max_balance) * 100 : 0;
         if (current_drawdown_pct > drawdown_pct) {
             drawdown_pct = current_drawdown_pct;
         }
    });

    const estadisticas = {
        user_id: 2,
        tipo_periodo,
        fecha_inicio,
        fecha_fin,
        operaciones_totales,
        operaciones_ganadoras,
        operaciones_perdedoras,
        win_rate: parseFloat(win_rate.toFixed(2)), // Formatear para inserción
        rentabilidad: parseFloat(rentabilidad.toFixed(2)), // Formatear para inserción
        promedio_ganancia: parseFloat(promedio_ganancia.toFixed(2)), // Formatear para inserción
        promedio_perdida: parseFloat(promedio_perdida.toFixed(2)), // Formatear para inserción
        rr_ratio: parseFloat(rr_ratio.toFixed(4)), // Formatear para inserción
        drawdown_max: parseFloat(drawdown_max.toFixed(2)), // Formatear para inserción
        drawdown_pct: parseFloat(drawdown_pct.toFixed(2)), // Formatear para inserción
        balance_final: parseFloat(balance.toFixed(2)), // Formatear para inserción
        max_balance: parseFloat(max_balance.toFixed(2)), // Formatear para inserción
        creado_en: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    console.log('Estadísticas calculadas:', estadisticas);
    return estadisticas;
};

// Función para generar nuevas estadísticas del período actual
export const generarEstadisticasActuales = async () => {
    try {
        // Solo generamos y almacenamos para los tipos de período presentes en el ENUM de la base de datos
        const tipos_periodo_almacenables = ['semanal', 'mensual', 'semestral', 'anual'];
        const ahora = new Date();
        
        console.log('Iniciando generación y almacenamiento de estadísticas para:', ahora);
        
        for (const tipo_periodo of tipos_periodo_almacenables) { // Iteramos solo sobre los tipos almacenables
            const { fecha_inicio, fecha_fin } = calcularFechasPeriodo(tipo_periodo, ahora);
            
            // Verificar si ya existen estadísticas para este período
            const [existentes] = await conexion.query(
                'SELECT * FROM estadisticas WHERE tipo_periodo = ? AND fecha_inicio = ? AND fecha_fin = ? AND user_id = ?',
                [tipo_periodo, fecha_inicio, fecha_fin, 2] // Aseguramos que solo se busque por tipos válidos de la BD
            );

            console.log(`Verificando estadísticas existentes para ${tipo_periodo}:`, existentes.length);

            // Solo generamos y guardamos nuevas estadísticas si no existen para este período
            if (existentes.length === 0) {
                const estadisticas = await calcularEstadisticasPeriodo(tipo_periodo, fecha_inicio, fecha_fin);
                
                // Ahora incluimos drawdown_pct y max_balance ya que se añadieron a la BD
                const [resultado] = await conexion.query(
                    `INSERT INTO estadisticas (
                        user_id, tipo_periodo, fecha_inicio, fecha_fin, operaciones_totales,
                        operaciones_ganadoras, operaciones_perdedoras, win_rate,
                        rentabilidad, promedio_ganancia, promedio_perdida,
                        rr_ratio, drawdown_max, drawdown_pct, balance_final, max_balance, creado_en
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, // Ajustado número de placeholders
                    [
                        estadisticas.user_id,
                        estadisticas.tipo_periodo,
                        estadisticas.fecha_inicio,
                        estadisticas.fecha_fin,
                        estadisticas.operaciones_totales,
                        estadisticas.operaciones_ganadoras,
                        estadisticas.operaciones_perdedoras,
                        estadisticas.win_rate,
                        estadisticas.rentabilidad,
                        estadisticas.promedio_ganancia,
                        estadisticas.promedio_perdida,
                        estadisticas.rr_ratio,
                        estadisticas.drawdown_max,
                        estadisticas.drawdown_pct, // Incluir valor
                        estadisticas.balance_final,
                        estadisticas.max_balance, // Incluir valor
                        estadisticas.creado_en
                    ]
                );

                console.log(`Estadísticas insertadas para ${tipo_periodo}:`, resultado);
            }
        }
    } catch (error) {
        console.error('Error al generar y almacenar estadísticas automáticamente:', error);
    }
};

export const generarEstadisticasPeriodoEspecifico = async (tipo_periodo, fecha_referencia) => {
    try {
        // Esta función calcula estadísticas para CUALQUIER tipo_periodo o fecha_referencia, pero solo
        // intenta almacenar en la BD si el tipo_periodo es uno de los ALMACENABLES.

        const { fecha_inicio, fecha_fin } = calcularFechasPeriodo(tipo_periodo, new Date(fecha_referencia));
        
        const tipos_periodo_almacenables = ['semanal', 'mensual', 'semestral', 'anual'];
        let estadisticasAlmacenadas = null;

        // Si el tipo de período es almacenable, verificamos si ya existe en la BD
        if (tipos_periodo_almacenables.includes(tipo_periodo)) {
             const [existentes] = await conexion.query(
                'SELECT * FROM estadisticas WHERE tipo_periodo = ? AND fecha_inicio = ? AND fecha_fin = ? AND user_id = ?',
                [tipo_periodo, fecha_inicio, fecha_fin, 2]
            );
            if (existentes.length > 0) {
                estadisticasAlmacenadas = existentes[0];
            }
        }

        // Si no encontramos estadísticas almacenadas para este período (o si no es almacenable),
        // calculamos las estadísticas dinámicamente.
        if (!estadisticasAlmacenadas) {
            const estadisticasCalculadas = await calcularEstadisticasPeriodo(tipo_periodo, fecha_inicio, fecha_fin);
            
            // Si el tipo de período es almacenable Y no existía, lo insertamos
            if (tipos_periodo_almacenables.includes(tipo_periodo)) {
                 // Ahora incluimos drawdown_pct y max_balance ya que se añadieron a la BD
                const [resultado] = await conexion.query(
                    `INSERT INTO estadisticas (
                        user_id, tipo_periodo, fecha_inicio, fecha_fin, operaciones_totales,
                        operaciones_ganadoras, operaciones_perdedoras, win_rate,
                        rentabilidad, promedio_ganancia, promedio_perdida,
                        rr_ratio, drawdown_max, drawdown_pct, balance_final, max_balance, creado_en
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, // Ajustado número de placeholders
                    [
                        estadisticasCalculadas.user_id,
                        estadisticasCalculadas.tipo_periodo,
                        estadisticasCalculadas.fecha_inicio,
                        estadisticasCalculadas.fecha_fin,
                        estadisticasCalculadas.operaciones_totales,
                        estadisticasCalculadas.operaciones_ganadoras,
                        estadisticasCalculadas.operaciones_perdedoras,
                        estadisticasCalculadas.win_rate,
                        estadisticasCalculadas.rentabilidad,
                        estadisticasCalculadas.promedio_ganancia,
                        estadisticasCalculadas.promedio_perdida,
                        estadisticasCalculadas.rr_ratio,
                        estadisticasCalculadas.drawdown_max,
                        estadisticasCalculadas.drawdown_pct, // Incluir valor
                        estadisticasCalculadas.balance_final,
                        estadisticasCalculadas.max_balance, // Incluir valor
                        estadisticasCalculadas.creado_en
                    ]
                );
                console.log(`Estadísticas insertadas para ${tipo_periodo} en ${fecha_referencia}:`, resultado);
            }
            return estadisticasCalculadas; // Siempre devolvemos las estadísticas calculadas
        }

        // Si encontramos estadísticas almacenadas, las devolvemos
        console.log(`Estadísticas encontradas en BD para ${tipo_periodo} en ${fecha_referencia}`);
        return estadisticasAlmacenadas;

    } catch (error) {
        console.error('Error al generar estadísticas para período específico:', error);
        throw error;
    }
};

export const obtenerEstadisticas = async (req, res) => {
    try {
        const { tipo_periodo } = req.params;
        const { desde, hasta, periodo_anterior } = req.query;
        
        console.log('Obteniendo estadísticas para:', { tipo_periodo, desde, hasta, periodo_anterior });
        
        let fecha_referencia = new Date(); // Por defecto, la fecha de referencia es ahora
        let estadisticasResultado;

        if (desde && hasta) {
            // Si se especifican desde y hasta, calculamos directamente el rango personalizado
            // Validar formato de fechas
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaRegex.test(desde) || !fechaRegex.test(hasta)) {
                return res.status(400).json({
                    message: "Formato de fecha inválido. Use el formato YYYY-MM-DD",
                    ejemplo: "2024-03-21"
                });
            }
            
            const fecha_inicio_obj = new Date(desde);
            const fecha_fin_obj = new Date(hasta);
            fecha_fin_obj.setHours(23, 59, 59, 999); // Asegurar que la fecha fin incluya todo el día

            // Calcular estadísticas para el rango personalizado
            estadisticasResultado = await calcularEstadisticasPeriodo(
                'personalizado', // Usamos un tipo 'personalizado' para el cálculo
                fecha_inicio_obj.toISOString().slice(0, 19).replace('T', ' '),
                fecha_fin_obj.toISOString().slice(0, 19).replace('T', ' ')
            );

        } else {
            // Si no se especifican desde y hasta, calculamos según tipo_periodo y periodo_anterior
             if (req.query.fecha_referencia) {
                 try {
                     // Parseo manual para evitar problemas de zona horaria
                     const [anio, mes, dia] = req.query.fecha_referencia.split('-').map(Number);
                     fecha_referencia = new Date(anio, mes - 1, dia);
                     if (isNaN(fecha_referencia.getTime())) {
                         return res.status(400).json({ message: "Formato de fecha de referencia inválido." });
                     }
                 } catch (e) {
                      return res.status(400).json({ message: "Formato de fecha de referencia inválido." });
                 }
            }
            
            // Usamos generarEstadisticasPeriodoEspecifico para manejar la lógica de cálculo/almacenamiento
            // Esta función devolverá las estadísticas almacenadas si existen, o las calculará e insertará si es un tipo almacenable y no existe.
            estadisticasResultado = await generarEstadisticasPeriodoEspecifico(
                tipo_periodo,
                fecha_referencia // Pasamos el objeto Date completo
            );
        }

        // Devolvemos las estadísticas calculadas o encontradas
        return res.status(200).json([estadisticasResultado]);

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return res.status(500).json({ message: "Error en el servidor: " + error.message });
    }
};

setInterval(generarEstadisticasActuales, 43200000); 
