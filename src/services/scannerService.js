const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/prismaClient');

const createScan = async (url, userId) => {
  return prisma.scan.create({
    data: {
      url,
      status: 'pending',
      ownerId: userId,
      reportPath: '',
    },
  });
};

const fetchScanHistory = async (userId) => {
  return prisma.scan.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
  });
};

const fetchScanReport = async (scanId, userId) => {
  const scan = await prisma.scan.findUnique({ where: { id: scanId } });

  if (!scan) throw new Error('NOT_FOUND');
  if (scan.ownerId !== userId) throw new Error('FORBIDDEN');

  if (!fs.existsSync(scan.reportPath)) throw new Error('FILE_NOT_FOUND');

  return path.resolve(scan.reportPath);
};

const fetchScanProgress = async (scanId, userId) => {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    select: {
      id: true,
      url: true,
      status: true,
      progressLog: true,
      createdAt: true,
      ownerId: true,
    },
  });

  if (!scan) throw new Error('NOT_FOUND');
  if (scan.ownerId !== userId) throw new Error('FORBIDDEN');

  return scan;
};

const fetchScanLogs = async (scanId) => {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    select: { stdout: true, stderr: true },
  });

  if (!scan) throw new Error('NOT_FOUND');

  return {
    stdout: scan.stdout || 'Sin logs de salida.',
    stderr: scan.stderr || 'Sin logs de error.',
  };
};

const launchZapScan = (url, scanId) => {
  return new Promise(async (resolve, reject) => {
    const outputFile = `report-${scanId}.html`;
    const reportsPath = path.join(__dirname, '../../reports');
    const reportFullPath = path.join(reportsPath, outputFile);

    try {
      console.log(`[Scan ${scanId}] Inicializando escaneo con Docker...`);
      await prisma.scan.update({
        where: { id: scanId },
        data: {
          progressLog: 'Inicializando escaneo con Docker...',
        },
      });

      const cmd = `docker run --rm -v "${reportsPath}:/zap/wrk/:rw" zaproxy/zap-stable zap-baseline.py -t ${url} -r ${outputFile}`;

      exec(cmd, async (error, stdout, stderr) => {
        console.log(`[Scan ${scanId}] Ejecutando ZAP...`);

        await prisma.scan.update({
          where: { id: scanId },
          data: {
            progressLog: 'Ejecutando ZAP... esperando resultados...',
          },
        });

        if (stdout) console.log(`[Scan ${scanId}] STDOUT:\n${stdout}`);
        if (stderr) console.error(`[Scan ${scanId}] STDERR:\n${stderr}`);

        await prisma.scan.update({
          where: { id: scanId },
          data: {
            stdout: stdout?.slice(-3000) || '',
            stderr: stderr?.slice(-3000) || '',
          },
        });

        const logsDir = path.join(__dirname, '../../logs');
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir);
        }
        const logFilePath = path.join(logsDir, `scan-${scanId}.log`);
        fs.writeFileSync(logFilePath, `${stdout}\n\n--- STDERR ---\n${stderr}`);

        const reportExists = fs.existsSync(reportFullPath);

        if (reportExists) {
          await prisma.scan.update({
            where: { id: scanId },
            data: {
              status: 'completed',
              reportPath: reportFullPath,
              progressLog: 'Escaneo completado. Reporte generado correctamente.',
            },
          });
          console.log(`[Scan ${scanId}] Reporte generado exitosamente.`);
          return resolve({ outputFile });
        } else {
          await prisma.scan.update({
            where: { id: scanId },
            data: {
              status: 'failed',
              progressLog: ' ZAP no generó el reporte. Verifica el log de error.',
            },
          });

          console.error(`[Scan ${scanId}]  Reporte NO generado. Error potencial: ${error?.message || 'desconocido'}`);
          return reject(new Error(`ZAP no generó el reporte correctamente. ${error?.message || ''}`));
        }
      });
    } catch (error) {
      await prisma.scan.update({
        where: { id: scanId },
        data: {
          status: 'failed',
          progressLog: ` Error inesperado al ejecutar el escaneo: ${error.message}`,
        },
      });

      console.error(`[Scan ${scanId}]  Error crítico: ${error.message}`);
      return reject(error);
    }
  });
};

module.exports = {
  createScan,
  fetchScanHistory,
  fetchScanReport,
  fetchScanProgress,
  fetchScanLogs,
  launchZapScan,
};