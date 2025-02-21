import { nanoid } from 'nanoid';
import { prisma } from './prisma.service';
import { config } from '../config';

export class UrlService {
  static async createShortUrl(originalUrl: string, customSlug?: string, userId?: string) {
    const shortSlug = customSlug || nanoid(config.slugLength);
    
    // Check if custom slug is already taken
    if (customSlug) {
      const existing = await prisma.url.findFirst({
        where: {
          OR: [
            { shortSlug: customSlug },
            { customSlug: customSlug }
          ]
        }
      });
      if (existing) {
        throw new Error('Custom slug already taken');
      }
    }

    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortSlug,
        customSlug,
        userId
      }
    });

    return {
      ...url,
      shortUrl: `${config.baseUrl}/${shortSlug}`
    };
  }

  static async getUrlBySlug(slug: string) {
    const url = await prisma.url.findFirst({
      where: {
        OR: [
          { shortSlug: slug },
          { customSlug: slug }
        ]
      }
    });

    if (!url) {
      return null;
    }

    await prisma.url.update({
      where: { id: url.id },
      data: { visitCount: { increment: 1 } }
    });

    return url;
  }

  static async getAllUrls() {
    return prisma.url.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        analytics: {
          select: {
            visitedAt: true,
            ipAddress: true,
            userAgent: true
          }
        }
      }
    });
  }

  static async getUserUrls(userId: string) {
    return prisma.url.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        analytics: {
          select: {
            visitedAt: true,
            ipAddress: true,
            userAgent: true
          }
        }
      }
    });
  }

  static async updateUrl(id: string, userId: string, data: { customSlug?: string }) {
    // Check if custom slug is already taken
    if (data.customSlug) {
      const existing = await prisma.url.findFirst({
        where: {
          OR: [
            { shortSlug: data.customSlug },
            { customSlug: data.customSlug }
          ],
          NOT: { id }
        }
      });
      if (existing) {
        throw new Error('Custom slug already taken');
      }
    }

    return prisma.url.update({
      where: { 
        id,
        userId 
      },
      data
    });
  }

  static async deleteUrl(id: string, userId: string) {
    // First delete all analytics records for this URL
    await prisma.analytics.deleteMany({
      where: { urlId: id }
    });

    // Then delete the URL
    return prisma.url.delete({
      where: { 
        id,
        userId 
      }
    });
  }

  static async trackVisit(urlId: string, ipAddress?: string, userAgent?: string) {
    return prisma.analytics.create({
      data: {
        urlId,
        ipAddress,
        userAgent
      }
    });
  }
} 