import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
// import { PrismaService } from '../../../../core/prisma/prisma.service';
// import { InjectQueue } from '@nestjs/bullmq';
// import { Queue } from 'bullmq';

export interface DispatchWave {
  orderId: string;
  waveNumber: number;
  latitude: number;
  longitude: number;
  tier: 'OURO' | 'PRATA' | 'BRONZE';
  radiusKm: number;
}

@Injectable()
export class SmartDispatchService {
  private readonly logger = new Logger(SmartDispatchService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    // @InjectQueue('dispatch-waves') private dispatchQueue: Queue,
    // private prisma: PrismaService,
  ) {}

  /**
   * Inicializa o algoritmo de dispatch.
   * Cria a primeira onda (Tier OURO, raio 5km)
   */
  async startDispatch(orderId: string, lat: number, lng: number) {
    this.logger.log(`Iniciando Smart Dispatch para a Ordem ${orderId}`);
    
    await this.processWave({
      orderId,
      waveNumber: 1,
      latitude: lat,
      longitude: lng,
      tier: 'OURO',
      radiusKm: 5,
    });
  }

  /**
   * Processa uma onda específica executando a query espacial no PostGIS.
   */
  async processWave(wave: DispatchWave) {
    this.logger.log(`Processando Onda ${wave.waveNumber} (Tier: ${wave.tier}, Raio: ${wave.radiusKm}km)`);

    // Em produção, isso usaria o PostGIS:
    // const providers = await this.prisma.$queryRaw`
    //   SELECT id, name FROM providers 
    //   WHERE tier = ${wave.tier}
    //   AND ST_DWithin(location, ST_MakePoint(${wave.longitude}, ${wave.latitude})::geography, ${wave.radiusKm * 1000})
    //   AND status = 'AVAILABLE'
    //   LIMIT 5;
    // `;

    // Simulação Mock
    const providers = [
      { id: 'provider-test', name: 'João (Ouro)' },
    ];

    if (providers.length > 0) {
      this.logger.log(`Prestadores encontrados: ${providers.length}. Disparando Push Notifications.`);
      // eventEmitter.emit('push.send', { ... })
      
      // Agenda o timeout para pular para a próxima onda se ninguém aceitar
      // await this.dispatchQueue.add('wave-timeout', wave, { delay: 15000 });
      return providers;
    } else {
      this.logger.log(`Nenhum prestador encontrado na Onda ${wave.waveNumber}.`);
      return this.triggerNextWave(wave);
    }
  }

  /**
   * Expande a onda (aumenta o raio ou baixa o Tier)
   */
  async triggerNextWave(currentWave: DispatchWave) {
    if (currentWave.waveNumber === 1) {
      return this.processWave({
        ...currentWave,
        waveNumber: 2,
        tier: 'PRATA',
        radiusKm: 10,
      });
    } else if (currentWave.waveNumber === 2) {
      return this.processWave({
        ...currentWave,
        waveNumber: 3,
        tier: 'BRONZE',
        radiusKm: 15,
      });
    } else {
      this.logger.warn(`Onda máxima atingida. Ordem ${currentWave.orderId} sem cobertura.`);
      // Emit event order_unfulfilled
    }
  }
}
