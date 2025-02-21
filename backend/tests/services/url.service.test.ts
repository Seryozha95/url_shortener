import { UrlService } from '../../src/services/url.service';
import { prisma } from '../../src/services/prisma.service';
import { config } from '../../src/config';

// Mock nanoid to return a consistent value
jest.mock('nanoid', () => ({
  nanoid: () => 'abc123'
}));

// Mock the prisma client
jest.mock('../../src/services/prisma.service', () => ({
  prisma: {
    url: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    analytics: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe('UrlService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createShortUrl', () => {
    it('should create a URL without custom slug', async () => {
      const mockUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        shortSlug: 'abc123',
        visitCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.url.create as jest.Mock).mockResolvedValue(mockUrl);

      const result = await UrlService.createShortUrl('https://example.com');

      expect(prisma.url.create).toHaveBeenCalledWith({
        data: {
          originalUrl: 'https://example.com',
          shortSlug: 'abc123',
          customSlug: undefined,
          userId: undefined,
        },
      });

      expect(result).toEqual({
        ...mockUrl,
        shortUrl: `${config.baseUrl}/${mockUrl.shortSlug}`,
      });
    });

    it('should create a URL with custom slug', async () => {
      const mockUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        shortSlug: 'custom',
        customSlug: 'custom',
        visitCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.url.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.url.create as jest.Mock).mockResolvedValue(mockUrl);

      const result = await UrlService.createShortUrl('https://example.com', 'custom');

      expect(prisma.url.create).toHaveBeenCalledWith({
        data: {
          originalUrl: 'https://example.com',
          shortSlug: 'custom',
          customSlug: 'custom',
          userId: undefined,
        },
      });

      expect(result).toEqual({
        ...mockUrl,
        shortUrl: `${config.baseUrl}/${mockUrl.shortSlug}`,
      });
    });

    it('should throw error if custom slug is taken', async () => {
      (prisma.url.findFirst as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(
        UrlService.createShortUrl('https://example.com', 'taken')
      ).rejects.toThrow('Custom slug already taken');
    });
  });

  describe('getUrlBySlug', () => {
    it('should return URL and increment visit count', async () => {
      const mockUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        shortSlug: 'abc123',
        visitCount: 0,
      };

      (prisma.url.findFirst as jest.Mock).mockResolvedValue(mockUrl);
      (prisma.url.update as jest.Mock).mockResolvedValue({ ...mockUrl, visitCount: 1 });

      const result = await UrlService.getUrlBySlug('abc123');

      expect(prisma.url.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { visitCount: { increment: 1 } },
      });

      expect(result).toEqual(mockUrl);
    });

    it('should return null for non-existent slug', async () => {
      (prisma.url.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await UrlService.getUrlBySlug('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getUserUrls', () => {
    it('should return user URLs with analytics', async () => {
      const mockUrls = [
        {
          id: '1',
          originalUrl: 'https://example.com',
          shortSlug: 'abc123',
          analytics: [],
        },
      ];

      (prisma.url.findMany as jest.Mock).mockResolvedValue(mockUrls);

      const result = await UrlService.getUserUrls('user1');

      expect(prisma.url.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
        include: {
          analytics: {
            select: {
              visitedAt: true,
              ipAddress: true,
              userAgent: true,
            },
          },
        },
      });

      expect(result).toEqual(mockUrls);
    });
  });

  describe('deleteUrl', () => {
    it('should delete URL and its analytics', async () => {
      await UrlService.deleteUrl('1', 'user1');

      expect(prisma.analytics.deleteMany).toHaveBeenCalledWith({
        where: { urlId: '1' },
      });

      expect(prisma.url.delete).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user1' },
      });
    });
  });

  describe('updateUrl', () => {
    it('should update URL with new custom slug', async () => {
      const mockUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        shortSlug: 'abc123',
        customSlug: 'new-custom',
        visitCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.url.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.url.update as jest.Mock).mockResolvedValue(mockUrl);

      const result = await UrlService.updateUrl('1', 'user1', { customSlug: 'new-custom' });

      expect(prisma.url.update).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user1' },
        data: { customSlug: 'new-custom' }
      });

      expect(result).toEqual(mockUrl);
    });

    it('should throw error if new custom slug is taken', async () => {
      (prisma.url.findFirst as jest.Mock).mockResolvedValue({ id: '2' });

      await expect(
        UrlService.updateUrl('1', 'user1', { customSlug: 'taken' })
      ).rejects.toThrow('Custom slug already taken');
    });
  });

  describe('trackVisit', () => {
    it('should create analytics record with IP and user agent', async () => {
      const mockAnalytics = {
        id: '1',
        urlId: '1',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        visitedAt: new Date(),
      };

      (prisma.analytics.create as jest.Mock).mockResolvedValue(mockAnalytics);

      const result = await UrlService.trackVisit('1', '127.0.0.1', 'test-agent');

      expect(prisma.analytics.create).toHaveBeenCalledWith({
        data: {
          urlId: '1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        },
      });

      expect(result).toEqual(mockAnalytics);
    });

    it('should create analytics record without IP and user agent', async () => {
      const mockAnalytics = {
        id: '1',
        urlId: '1',
        visitedAt: new Date(),
      };

      (prisma.analytics.create as jest.Mock).mockResolvedValue(mockAnalytics);

      const result = await UrlService.trackVisit('1');

      expect(prisma.analytics.create).toHaveBeenCalledWith({
        data: {
          urlId: '1',
          ipAddress: undefined,
          userAgent: undefined,
        },
      });

      expect(result).toEqual(mockAnalytics);
    });
  });
}); 