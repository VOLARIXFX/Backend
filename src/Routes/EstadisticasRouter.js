import { Router } from "express";
import { obtenerEstadisticas } from "../Controllers/EstadisticasController.js";

const estadisticas = Router();

// Ruta para obtener estadísticas
// Ejemplos de uso:
// 1. Estadísticas actuales:
//    GET /estadisticas/mensual
//    GET /estadisticas/semanal
//    GET /estadisticas/anual
//
// 2. Estadísticas del período anterior:
//    GET /estadisticas/mensual?periodo_anterior=true
//    GET /estadisticas/semanal?periodo_anterior=true
//
// 3. Estadísticas con rango personalizado:
//    GET /estadisticas/personalizado?desde=2024-01-01&hasta=2024-03-31
//
// Tipos de período disponibles:
// - diario: Estadísticas del día actual
// - semanal: Estadísticas de la semana actual (lunes a domingo)
// - mensual: Estadísticas del mes actual
// - semestral: Estadísticas del semestre actual
// - anual: Estadísticas del año actual
// - personalizado: Estadísticas de un rango de fechas específico

estadisticas.get('/:tipo_periodo', obtenerEstadisticas);
// Para estadísticas históricas:
// /estadisticas/mensual?fecha_referencia=2023-11-15
// /estadisticas/semestral?fecha_referencia=2023-07-01
export default estadisticas;
