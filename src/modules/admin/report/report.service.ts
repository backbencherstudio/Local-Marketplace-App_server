import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { CreateReportTypeDto } from './dto/create-report-type.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportCategoryDto } from './dto/create-report-category.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class ReportService {

  constructor(private readonly prisma: PrismaService, private jwtService: JwtService,) { }
  async createReportType(createReportTypeDto: CreateReportTypeDto) {
    const reportType = await this.prisma.reportType.create({
      data: {
        name: createReportTypeDto.name,
      },
    });

    return {
      message: 'Report type created successfully',
      data: reportType,
    }
  }
  async createReportCategory(createReportCategoryDto: CreateReportCategoryDto) {
    const reportCategory = await this.prisma.reportCategory.create({
      data: {
        name: createReportCategoryDto.name,
      },
    });

    return {
      message: 'Report category created successfully',
      data: reportCategory,
    }
  }
  async getAllReportTypes() {
    const reportTypes = await this.prisma.reportType.findMany();
    return {
      message: 'Report types fetched successfully',
      data: reportTypes,
    }
  }
  async getAllReportCategories() {
    const reportCategories = await this.prisma.reportCategory.findMany();
    return {
      message: 'Report categories fetched successfully',
      data: reportCategories,
    }
  }
  async createReport(createReportDto: CreateReportDto, req: any, serviceId: string) {
    const userId = req.user.userId
    console.log(`Creating report for service ID: ${serviceId} by user ID: ${userId}`);

    if (!userId) {
      return {
        message: 'Log in to report',
        error: true,
      };
    }

    const reportTypeID = createReportDto.report_type;
    const reportCategoryID = createReportDto.report_category;

    const existingReportType = await this.prisma.reportType.findUnique({
      where: { id: reportTypeID },
      select: { id: true, name: true },
    });

    const existingReportCategory = await this.prisma.reportCategory.findUnique({
      where: { id: reportCategoryID },
      select: { id: true, name: true },
    });

    if (!existingReportType || !existingReportCategory) {
      return {
        message: 'Invalid report type or category',
        error: true,
      };
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return {
        message: 'User not found',
        error: true,
      };
    }

    const service = await this.prisma.services.findUnique({
      where: { id: serviceId },
      select: { id: true, title: true, username: true, status:true , user: { select: { id: true, email: true } } },
    });

    if (!service) {
      return {
        message: 'Service not found',
        error: true,
      };
    }

    if(user.id === service.user.id) {
      return {
        message: 'You cannot report your own service',
        error: true,
      };

    }
    if(service.status !== 'active') {
      return {
        message: 'You cannot report a service that is not active',
        error: true,
      };
    }

    const report = await this.prisma.report.create({
      data: {
        report_type: existingReportType.id,
        report_category: existingReportCategory.id,
        reason: createReportDto.reason,
        user: {
          connect: { id: userId },
        },
        service: {
          connect: { id: service.id },
        },
      },
    });

    await this.prisma.services.update({
      where: { id: serviceId },
      data: { is_reported: { increment: 1 } },
    });

    const formattedReport = {
      id: report.id,
      report_type: existingReportType.name,
      report_category: existingReportCategory.name,
      reason: report.reason,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      service: {
        id: service.id,
        title: service.title,
        username: service.username,
        user: {
          id: service.user.id,
          email: service.user.email,
        },
      },
    };

    return {
      message: 'Report created successfully',
      data: formattedReport,
    };
  }
  async getAllReports() {
    try {
      const reports = await this.prisma.report.findMany({
        select: {
          id: true,
          service_id: true,
          report_type: true,
          report_category: true,
          reason: true,
          user_id: true,
          created_at: true,
        },
      });

      if (!reports.length) {
        return {
          message: 'No reports found',
          data: [],
        };
      }

      const reportTypeIds = [...new Set(reports.map(report => report.report_type))];
      const reportCategoryIds = [...new Set(reports.map(report => report.report_category))];
      const userIds = [...new Set(reports.map(report => report.user_id))];
      const serviceIds = [...new Set(reports.map(report => report.service_id))];

      const [reportTypes, reportCategories, users, services] = await Promise.all([
        this.prisma.reportType.findMany({
          where: { id: { in: reportTypeIds } },
          select: { id: true, name: true },
        }),
        this.prisma.reportCategory.findMany({
          where: { id: { in: reportCategoryIds } },
          select: { id: true, name: true },
        }),
        this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            email: true,
            name: true,
            country: true,
            city: true,
            phone_number: true,
          },
        }),
        this.prisma.services.findMany({
          where: { id: { in: serviceIds } },
          select: {
            id: true,
            title: true,
            username: true,
            location: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        }),
      ]);

      const reportTypeMap = new Map(reportTypes.map(rt => [rt.id, rt]));
      const reportCategoryMap = new Map(reportCategories.map(rc => [rc.id, rc]));
      const userMap = new Map(users.map(u => [u.id, u]));
      const serviceMap = new Map(services.map(s => [s.id, s]));

      const formattedReports = reports.map(report => {
        const reportType = reportTypeMap.get(report.report_type);
        const reportCategory = reportCategoryMap.get(report.report_category);
        const user = userMap.get(report.user_id);
        const service = serviceMap.get(report.service_id);

        return {
          id: report.id,
          service_id: report.service_id,
          report_type: reportType?.name || null,
          report_category: reportCategory?.name || null,
          reason: report.reason,
          reported_by: user ? {
            id: user.id,
            email: user.email,
            name: user.name
          } : null,
          service: service ? {
            id: service.id,
            title: service.title,
            username: service.username,
            service_location: service.location,
            service_owner: {
              id: service.user.id,
              email: service.user.email,
              country: user?.country || null,
              city: user?.city || null,
              phone_number: user?.phone_number || null,
            },
          } : null,
          created_at: report.created_at,
        };
      });
      return {
        message: 'All reports fetched successfully',
        data: formattedReports,
      };
    } catch (error) {
      console.error('Error fetching reports:', error);
      return {
        message: 'An error occurred while fetching reports',
        error: error.message,
      };
    }
  }
  async getReportById(id: string) {
    try {
      const report = await this.prisma.report.findUnique({
        where: { id },
        select: {
          id: true,
          service_id: true,
          report_type: true,
          report_category: true,
          reason: true,
          user_id: true,
          created_at: true,
        },
      });

      if (!report) {
        return {
          message: 'Report not found',
          data: null,
        };
      }

      const [reportType, reportCategory] = await Promise.all([
        this.prisma.reportType.findUnique({
          where: { id: report.report_type },
          select: { id: true, name: true },
        }),
        this.prisma.reportCategory.findUnique({
          where: { id: report.report_category },
          select: { id: true, name: true },
        }),
      ]);

      const formattedReport = {
        id: report.id,
        service_id: report.service_id,
        report_type: reportType?.name || null,
        report_category: reportCategory?.name || null,
        reason: report.reason,
        created_at: report.created_at,
      };

      return {
        message: 'Report fetched successfully',
        data: formattedReport,
      };
    } catch (error) {
      console.error(`Error fetching report with ID ${id}:`, error);
      return {
        message: 'An error occurred while fetching the report',
        error: error.message,
      };
    }
  }
}



