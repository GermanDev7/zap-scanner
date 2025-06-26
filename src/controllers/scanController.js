const scanService = require('../services/scannerService');

const startScan = async (req, res) => {
  const { url } = req.body;
  const userId = req.user.userId;

  try {
    const newScan = await scanService.createScan(url, userId);
    scanService.launchZapScan(url, newScan.id).catch(err => {
      console.error(`[Scan ${newScan.id}] Fallo el escaneo:`, err.message);
    });

    res.status(202).json({ message: 'Escaneo iniciado', scanId: newScan.id });
  } catch (err) {
    console.error('Error al iniciar escaneo:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getScanHistory = async (req, res) => {
  const userId = req.user.userId;
  try {
    const scans = await scanService.fetchScanHistory(userId);
    res.json(scans);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

const getScanReport = async (req, res) => {
  const scanId = req.params.id;
  const userId = req.user.userId;
  try {
    const filePath = await scanService.fetchScanReport(scanId, userId);
    res.sendFile(filePath);
  } catch (err) {
    switch (err.message) {
      case 'NOT_FOUND':
        res.status(404).json({ error: 'Reporte no encontrado' });
        break;
      case 'FORBIDDEN':
        res.status(403).json({ error: 'No autorizado para ver este reporte' });
        break;
      case 'FILE_NOT_FOUND':
        res.status(404).json({ error: 'Archivo de reporte no existe' });
        break;
      default:
        res.status(500).json({ error: 'Error al obtener el reporte' });
    }
  }
};

const getScanProgress = async (req, res) => {
  const scanId = req.params.scanId;
  const userId = req.user.userId;
  try {
    const scan = await scanService.fetchScanProgress(scanId, userId);
    res.json(scan);
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Escaneo no encontrado' });
    } else if (err.message === 'FORBIDDEN') {
      res.status(403).json({ error: 'No tienes permiso para ver este escaneo.' });
    } else {
      res.status(500).json({ error: 'Error al consultar el progreso del escaneo' });
    }
  }
};

const getScanLogs = async (req, res) => {
  const { scanId } = req.params;
  try {
    const logs = await scanService.fetchScanLogs(scanId);
    res.json(logs);
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Escaneo no encontrado' });
    } else {
      res.status(500).json({ error: 'Error del servidor al recuperar los logs.' });
    }
  }
};

module.exports = {
  startScan,
  getScanHistory,
  getScanReport,
  getScanProgress,
  getScanLogs,
};
