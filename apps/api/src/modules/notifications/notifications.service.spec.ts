import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let queue: any;
  let prisma: any;

  beforeEach(() => {
    queue = { add: jest.fn().mockResolvedValue(undefined) };
    prisma = {
      userDevice: {
        findMany: jest.fn(),
        upsert: jest.fn().mockResolvedValue({ id: 'dev-1' }),
      },
      providerProfile: {
        findUnique: jest.fn(),
      },
    };
    service = new NotificationsService(queue, prisma);
  });

  describe('sendToUser()', () => {
    it('should enqueue push notification for each user device', async () => {
      prisma.userDevice.findMany.mockResolvedValue([
        { pushToken: 'token-1' },
        { pushToken: 'token-2' },
      ]);

      await service.sendToUser('user-1', 'Título', 'Corpo da mensagem');

      expect(queue.add).toHaveBeenCalledTimes(2);
      expect(queue.add).toHaveBeenCalledWith(
        'send-push',
        expect.objectContaining({ token: 'token-1', title: 'Título', body: 'Corpo da mensagem', userId: 'user-1' }),
        expect.objectContaining({ attempts: 5 }),
      );
    });

    it('should not enqueue when user has no devices', async () => {
      prisma.userDevice.findMany.mockResolvedValue([]);

      await service.sendToUser('user-no-device', 'Title', 'Body');

      expect(queue.add).not.toHaveBeenCalled();
    });

    it('should use exponential backoff with 2s delay', async () => {
      prisma.userDevice.findMany.mockResolvedValue([{ pushToken: 'tok' }]);

      await service.sendToUser('user-1', 'T', 'B');

      expect(queue.add).toHaveBeenCalledWith(
        'send-push',
        expect.any(Object),
        expect.objectContaining({
          backoff: { type: 'exponential', delay: 2000 },
        }),
      );
    });
  });

  describe('handlePayoutFailed()', () => {
    it('should send notification when payout fails', async () => {
      prisma.providerProfile.findUnique.mockResolvedValue({ userId: 'user-p1' });
      prisma.userDevice.findMany.mockResolvedValue([{ pushToken: 'tok-p1' }]);

      await service.handlePayoutFailed({ providerId: 'p1', amount: '10000' });

      expect(queue.add).toHaveBeenCalledWith(
        'send-push',
        expect.objectContaining({
          title: expect.stringContaining('Payout'),
          userId: 'user-p1',
        }),
        expect.any(Object),
      );
    });

    it('should not send notification when provider profile not found', async () => {
      prisma.providerProfile.findUnique.mockResolvedValue(null);

      await service.handlePayoutFailed({ providerId: 'p-unknown', amount: '5000' });

      expect(queue.add).not.toHaveBeenCalled();
    });
  });

  describe('registerDevice()', () => {
    it('should upsert device with push token', async () => {
      await service.registerDevice('user-1', 'expo-push-token', 'ios', 'device-abc');

      expect(prisma.userDevice.upsert).toHaveBeenCalledWith({
        where: { pushToken: 'expo-push-token' },
        update: expect.objectContaining({ userId: 'user-1', platform: 'ios' }),
        create: expect.objectContaining({ userId: 'user-1', pushToken: 'expo-push-token' }),
      });
    });
  });
});
