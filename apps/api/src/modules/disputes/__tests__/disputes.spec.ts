import { Dispute } from '../domain/dispute.entity';
import { OpenDisputeUseCase } from '../application/open-dispute.usecase';
import { ResolveDisputeUseCase } from '../application/resolve-dispute.usecase';
import { ListDisputesUseCase } from '../application/list-disputes.usecase';
import { DisputeRepositoryPort } from '../ports/dispute-repository.port';

describe('Disputes Module (Hexagonal Architecture)', () => {
  let inMemoryRepo: DisputeRepositoryPort;
  let disputesMap: Map<string, Dispute>;
  let mockEventEmitter: { emit: jest.Mock };

  beforeEach(() => {
    disputesMap = new Map();
    mockEventEmitter = { emit: jest.fn() };

    inMemoryRepo = {
      save: jest.fn().mockImplementation(async (d: Dispute) => {
        disputesMap.set(d.id, d);
      }),
      findById: jest.fn().mockImplementation(async (id: string) => {
        return disputesMap.get(id) ?? null;
      }),
      findByOrderId: jest.fn().mockImplementation(async (orderId: string) => {
        return Array.from(disputesMap.values()).filter(d => d.orderId === orderId);
      }),
      findPending: jest.fn().mockImplementation(async () => {
        return Array.from(disputesMap.values()).filter(d => d.status === 'OPEN');
      }),
      findAll: jest.fn().mockImplementation(async () => {
        return Array.from(disputesMap.values());
      }),
      update: jest.fn().mockImplementation(async (d: Dispute) => {
        disputesMap.set(d.id, d);
      }),
    };
  });

  describe('Dispute Entity', () => {
    it('deve criar uma disputa com status inicial OPEN', () => {
      const dispute = Dispute.create({
        id: 'disp-1',
        orderId: 'ord-123',
        reason: 'Serviço incompleto',
        description: 'Prestador não finalizou a vedação',
      });

      expect(dispute.id).toBe('disp-1');
      expect(dispute.orderId).toBe('ord-123');
      expect(dispute.status).toBe('OPEN');
      expect(dispute.outcome).toBeNull();
    });

    it('deve lançar erro ao tentar criar sem motivo ou descrição', () => {
      expect(() => {
        Dispute.create({
          id: 'disp-1',
          orderId: 'ord-123',
          reason: '',
          description: 'alguma coisa',
        });
      }).toThrow('Motivo da disputa é obrigatório');

      expect(() => {
        Dispute.create({
          id: 'disp-1',
          orderId: 'ord-123',
          reason: 'motivo',
          description: '  ',
        });
      }).toThrow('Descrição da disputa é obrigatória');
    });

    it('deve resolver disputa com desfecho e notas', () => {
      const dispute = Dispute.create({
        id: 'disp-1',
        orderId: 'ord-123',
        reason: 'Qualidade insatisfatória',
        description: 'Vazamento após o serviço',
      });

      dispute.resolve('REFUND_FULL', 'Estorno total aprovado pelo suporte');
      expect(dispute.status).toBe('RESOLVED');
      expect(dispute.outcome).toBe('REFUND_FULL: Estorno total aprovado pelo suporte');
    });

    it('deve rejeitar resolução se a disputa não estiver OPEN', () => {
      const dispute = Dispute.create({
        id: 'disp-1',
        orderId: 'ord-123',
        reason: 'Atraso',
        description: 'Chegou 2h depois',
      });
      dispute.resolve('RELEASE_PROVIDER');

      expect(() => dispute.resolve('REFUND_FULL')).toThrow(
        'Apenas disputas com status OPEN podem ser resolvidas',
      );
    });
  });

  describe('OpenDisputeUseCase', () => {
    it('deve abrir uma nova disputa com sucesso', async () => {
      const useCase = new OpenDisputeUseCase(inMemoryRepo);

      const result = await useCase.execute({
        orderId: 'ord-100',
        reason: 'Danos a bens',
        description: 'Piso riscado durante o serviço',
      });

      expect(result.id).toBeDefined();
      expect(result.orderId).toBe('ord-100');
      expect(result.status).toBe('OPEN');
      expect(inMemoryRepo.save).toHaveBeenCalled();
    });

    it('deve impedir a abertura de mais de uma disputa em aberto para o mesmo pedido', async () => {
      const useCase = new OpenDisputeUseCase(inMemoryRepo);

      await useCase.execute({
        orderId: 'ord-dup',
        reason: 'Cobrança indevida',
        description: 'Valor cobrado superior ao app',
      });

      await expect(
        useCase.execute({
          orderId: 'ord-dup',
          reason: 'Outro motivo',
          description: 'Tentativa duplicada',
        }),
      ).rejects.toThrow('Já existe uma disputa em aberto para o pedido ord-dup');
    });
  });

  describe('ResolveDisputeUseCase', () => {
    it('deve resolver disputa com SPLIT_50_50 e emitir evento', async () => {
      const dispute = Dispute.create({
        id: 'disp-split',
        orderId: 'ord-split',
        reason: 'Desacordo comercial',
        description: 'Serviço feito pela metade',
      });
      await inMemoryRepo.save(dispute);

      const useCase = new ResolveDisputeUseCase(inMemoryRepo, mockEventEmitter as any);
      const resolved = await useCase.execute({
        disputeId: 'disp-split',
        outcome: 'SPLIT_50_50',
        notes: 'Acordo amigável entre cliente e prestador',
        adminId: 'admin-1',
      });

      expect(resolved.status).toBe('RESOLVED');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'dispute.resolved',
        expect.objectContaining({
          disputeId: 'disp-split',
          outcome: 'SPLIT_50_50',
          adminId: 'admin-1',
        }),
      );
    });

    it('deve rejeitar resolução de disputa inexistente', async () => {
      const useCase = new ResolveDisputeUseCase(inMemoryRepo, mockEventEmitter as any);

      await expect(
        useCase.execute({
          disputeId: 'disp-inexistente',
          outcome: 'RELEASE_PROVIDER',
        }),
      ).rejects.toThrow('Disputa com ID disp-inexistente não encontrada');
    });

    it('deve rejeitar desfecho com valor inválido', async () => {
      const useCase = new ResolveDisputeUseCase(inMemoryRepo, mockEventEmitter as any);

      await expect(
        useCase.execute({
          disputeId: 'disp-1',
          outcome: 'INVALID_OUTCOME' as any,
        }),
      ).rejects.toThrow('Desfecho inválido');
    });
  });

  describe('ListDisputesUseCase', () => {
    it('deve listar disputas pendentes e todas as disputas', async () => {
      const d1 = Dispute.create({ id: 'd1', orderId: 'o1', reason: 'r1', description: 'desc1' });
      const d2 = Dispute.create({ id: 'd2', orderId: 'o2', reason: 'r2', description: 'desc2' });
      d2.resolve('REFUND_FULL');

      await inMemoryRepo.save(d1);
      await inMemoryRepo.save(d2);

      const useCase = new ListDisputesUseCase(inMemoryRepo);

      const pending = await useCase.execute(true);
      expect(pending.length).toBe(1);
      expect(pending[0].id).toBe('d1');

      const all = await useCase.execute(false);
      expect(all.length).toBe(2);
    });
  });
});
