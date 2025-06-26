const express = require('express');
const { startScan, getScanHistory, getScanReport, getScanProgress, getScanLogs } = require('../controllers/scanController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();
/**
 * @swagger
 * /api/scan/start:
 *   post:
 *     summary: Inicia un escaneo ZAP para una URL
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 example: https://example.com
 *     responses:
 *       202:
 *         description: Escaneo iniciado exitosamente
 *       500:
 *         description: Error interno al iniciar el escaneo
 */
router.post('/start', authenticate, startScan);
/**
 * @swagger
 * /api/scan/history:
 *   get:
 *     summary: Obtiene el historial de escaneos del usuario autenticado
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de escaneos
 *       500:
 *         description: Error al recuperar el historial
 */
router.get('/history', authenticate, getScanHistory);
/**
 * @swagger
 * /api/scan/{id}/report:
 *   get:
 *     summary: Descarga el reporte HTML de un escaneo específico
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del escaneo
 *     responses:
 *       200:
 *         description: Reporte HTML
 *       403:
 *         description: No autorizado para acceder a este reporte
 *       404:
 *         description: Reporte no encontrado o archivo inexistente
 *       500:
 *         description: Error al obtener el reporte
 */
router.get('/:id/report', authenticate, getScanReport);
/**
 * @swagger
 * /api/scan/{scanId}/progress:
 *   get:
 *     summary: Consulta el progreso actual del escaneo
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scanId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del escaneo
 *     responses:
 *       200:
 *         description: Progreso del escaneo
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Escaneo no encontrado
 *       500:
 *         description: Error al consultar el progreso
 */
router.get('/:scanId/progress', getScanProgress, getScanReport);
/**
 * @swagger
 * /api/scan/{scanId}/logs:
 *   get:
 *     summary: Devuelve los logs (stdout y stderr) de un escaneo
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scanId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del escaneo
 *     responses:
 *       200:
 *         description: Logs devueltos exitosamente
 *       404:
 *         description: Escaneo no encontrado
 *       500:
 *         description: Error del servidor al recuperar los logs
 */
router.get('/:scanId/logs', authenticate, getScanLogs);

module.exports = router;
