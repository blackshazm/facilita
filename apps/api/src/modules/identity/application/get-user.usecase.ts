import { Injectable, Inject } from '@nestjs/common';
import { UserRepositoryPort, USER_REPOSITORY_PORT } from '../ports/user-repository.port';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    const wallet = await this.prisma.wallet.findUnique({
      where: { providerId: id },
      select: { promoBalance: true },
    });

    return {
      ...user.toJSON(),
      promoBalance: wallet?.promoBalance ? Number(wallet.promoBalance) : 0,
    };
  }
}
