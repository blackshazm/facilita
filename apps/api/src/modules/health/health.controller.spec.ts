import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HttpStatus } from '@nestjs/common';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn(),
            isReady: jest.fn(),
            isLive: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return HTTP 200 when status is ok', async () => {
      const mockResult: any = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: 100,
        environment: 'test',
        services: { database: 'up', memory: { rssMb: 50, heapUsedMb: 20, heapTotalMb: 30 } },
      };
      jest.spyOn(service, 'check').mockResolvedValue(mockResult);

      const res = mockResponse();
      await controller.check(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return HTTP 503 when status is degraded', async () => {
      const mockResult: any = {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime: 100,
        environment: 'test',
        services: { database: 'down', memory: { rssMb: 50, heapUsedMb: 20, heapTotalMb: 30 } },
      };
      jest.spyOn(service, 'check').mockResolvedValue(mockResult);

      const res = mockResponse();
      await controller.check(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('ready', () => {
    it('should return HTTP 200 when ready', async () => {
      jest.spyOn(service, 'isReady').mockResolvedValue({ ready: true, database: 'up' });
      const res = mockResponse();
      await controller.ready(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return HTTP 503 when not ready', async () => {
      jest.spyOn(service, 'isReady').mockResolvedValue({ ready: false, database: 'down' });
      const res = mockResponse();
      await controller.ready(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    });
  });

  describe('live', () => {
    it('should return HTTP 200 and live status', () => {
      jest.spyOn(service, 'isLive').mockReturnValue({ live: true, uptime: 50 });
      const res = mockResponse();
      controller.live(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });
});

