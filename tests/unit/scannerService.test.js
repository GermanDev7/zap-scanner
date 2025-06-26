const scanService = require('../../src/services/scannerService');
const prisma = require('../../src/config/prismaClient');

jest.mock('../../src/config/prismaClient', () => require('../../__mocks__/prismaClient'));


describe('scanService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('createScan', () => {
    it('debería crear un nuevo escaneo', async () => {
      prisma.scan.create.mockResolvedValue({ id: '123', url: 'https://test.com' });
      const result = await scanService.createScan('https://test.com', 'user1');
      expect(result).toHaveProperty('id', '123');
    });
  });

  describe('fetchScanHistory', () => {
    it('debería devolver el historial de escaneos del usuario', async () => {
      prisma.scan.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }]);
      const result = await scanService.fetchScanHistory('user1');
      expect(result).toHaveLength(2);
    });
  });

  describe('fetchScanLogs', () => {
    it('debería devolver los logs de escaneo', async () => {
      prisma.scan.findUnique.mockResolvedValue({ stdout: 'output', stderr: 'error' });
      const result = await scanService.fetchScanLogs('scan1');
      expect(result.stdout).toBe('output');
      expect(result.stderr).toBe('error');
    });

    it('debería lanzar error si el escaneo no existe', async () => {
      prisma.scan.findUnique.mockResolvedValue(null);
      await expect(scanService.fetchScanLogs('scan2')).rejects.toThrow('NOT_FOUND');
    });
  });

  describe('fetchScanReport', () => {
    it('debería devolver la ruta absoluta del reporte si es válido', async () => {
      const fakePath = '/fake/report.html';
      prisma.scan.findUnique.mockResolvedValue({
        id: 'scan3',
        ownerId: 'user1',
        reportPath: fakePath,
      });
      jest.spyOn(require('fs'), 'existsSync').mockReturnValueOnce(true);
      jest.spyOn(require('path'), 'resolve').mockImplementation((p) => p);
      const result = await scanService.fetchScanReport('scan3', 'user1');
      expect(result).toBe(fakePath);
    });

    it('debería lanzar NOT_FOUND si el escaneo no existe', async () => {
      prisma.scan.findUnique.mockResolvedValue(null);
      await expect(scanService.fetchScanReport('scan3', 'user1')).rejects.toThrow('NOT_FOUND');
    });

    it('debería lanzar FORBIDDEN si el usuario no es el dueño', async () => {
      prisma.scan.findUnique.mockResolvedValue({ ownerId: 'otherUser' });
      await expect(scanService.fetchScanReport('scan3', 'user1')).rejects.toThrow('FORBIDDEN');
    });

    it('debería lanzar FILE_NOT_FOUND si el archivo no existe', async () => {
      prisma.scan.findUnique.mockResolvedValue({
        ownerId: 'user1',
        reportPath: '/missing/report.html',
      });
      jest.spyOn(require('fs'), 'existsSync').mockReturnValueOnce(false);
      await expect(scanService.fetchScanReport('scan3', 'user1')).rejects.toThrow('FILE_NOT_FOUND');
    });
  });

  describe('fetchScanProgress', () => {
    it('debería devolver el progreso del escaneo si todo es válido', async () => {
      prisma.scan.findUnique.mockResolvedValue({
        id: 'scan4',
        ownerId: 'user1',
        url: 'https://test.com',
        status: 'pending',
        progressLog: 'Init',
        createdAt: new Date(),
      });
      const result = await scanService.fetchScanProgress('scan4', 'user1');
      expect(result).toHaveProperty('status', 'pending');
    });

    it('debería lanzar NOT_FOUND si no se encuentra el escaneo', async () => {
      prisma.scan.findUnique.mockResolvedValue(null);
      await expect(scanService.fetchScanProgress('scan4', 'user1')).rejects.toThrow('NOT_FOUND');
    });

    it('debería lanzar FORBIDDEN si el usuario no es el dueño', async () => {
      prisma.scan.findUnique.mockResolvedValue({ ownerId: 'otherUser' });
      await expect(scanService.fetchScanProgress('scan4', 'user1')).rejects.toThrow('FORBIDDEN');
    });
  });
});