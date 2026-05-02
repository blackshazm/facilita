const fs = require('fs');
const path = require('path');

const prismaSchemaPath = path.join(__dirname, 'packages/database/prisma/schema.prisma');
const prismaSchemaContent = `generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["identity", "catalog", "orders", "payments", "evidence", "fraud", "disputes"]
}

// Identity Schema
model User {
  id             String           @id @default(uuid())
  phone          String           @unique
  name           String?
  role           Role             @default(CUSTOMER)
  isVerified     Boolean          @default(false)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  profile        ProviderProfile?
  kycSubmissions KycSubmission[]

  @@schema("identity")
}

enum Role {
  CUSTOMER
  PROVIDER
  ADMIN

  @@schema("identity")
}

model ProviderProfile {
  id             String   @id @default(uuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  cpfCnpj        String   @unique
  rating         Float    @default(5.0)
  isOnline       Boolean  @default(false)
  availableDays  Int[]    // 0 = Sunday, 1 = Monday, etc.
  startHour      String   // e.g., "08:00"
  endHour        String   // e.g., "18:00"
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@schema("identity")
}

model KycSubmission {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  documentUrl String
  selfieUrl   String
  status      KycStatus @default(PENDING)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@schema("identity")
}

enum KycStatus {
  PENDING
  APPROVED
  REJECTED

  @@schema("identity")
}

// Order Schema
model Order {
  id          String      @id @default(uuid())
  userId      String
  providerId  String?
  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @default(0.0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@schema("orders")
}

enum OrderStatus {
  PENDING
  MATCHED
  EN_ROUTE
  ARRIVED
  IN_PROGRESS
  DONE
  CANCELED

  @@schema("orders")
}
`;

fs.writeFileSync(prismaSchemaPath, prismaSchemaContent);
console.log('schema.prisma updated successfully');

const files = {
  // Shared Kernel
  'apps/api/src/shared-kernel/decorators/current-user.decorator.ts': `import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
`,
  'apps/api/src/shared-kernel/guards/jwt-auth.guard.ts': `import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
`,
  'apps/api/src/shared-kernel/strategies/jwt.strategy.ts': `import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, role: payload.role };
  }
}
`,
  
  // Domain
  'apps/api/src/modules/identity/domain/user.entity.ts': `export class User {
  id: string;
  phone: string;
  name?: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
`,
  'apps/api/src/modules/identity/domain/interfaces/sms.service.interface.ts': `export interface ISmsService {
  sendOtp(phone: string): Promise<boolean>;
  verifyOtp(phone: string, code: string): Promise<boolean>;
}

export const SMS_SERVICE = Symbol('ISmsService');
`,

  // Application
  'apps/api/src/modules/identity/application/auth.service.ts': `import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ISmsService, SMS_SERVICE } from '../domain/interfaces/sms.service.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SMS_SERVICE) private readonly smsService: ISmsService,
    private readonly jwtService: JwtService
  ) {}

  async requestOtp(phone: string): Promise<boolean> {
    return this.smsService.sendOtp(phone);
  }

  async verifyOtp(phone: string, code: string): Promise<{ accessToken: string }> {
    const isValid = await this.smsService.verifyOtp(phone, code);
    if (!isValid) throw new Error('Invalid OTP');
    
    // TODO: Create or get user from repository
    const userId = 'placeholder-uuid';
    const role = 'CUSTOMER';

    const payload = { sub: userId, role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
`,

  // Infrastructure
  'apps/api/src/modules/identity/infrastructure/twilio-sms.service.ts': `import { Injectable } from '@nestjs/common';
import { ISmsService } from '../domain/interfaces/sms.service.interface';

@Injectable()
export class TwilioSmsService implements ISmsService {
  async sendOtp(phone: string): Promise<boolean> {
    console.log(\`Sending WhatsApp OTP to \${phone}\`);
    // Twilio SDK logic goes here
    return true;
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    console.log(\`Verifying OTP \${code} for \${phone}\`);
    // Twilio SDK logic goes here
    return code === '123456'; // mock
  }
}
`,

  // Interface
  'apps/api/src/modules/identity/interface/auth.controller.ts': `import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../application/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  async requestOtp(@Body() body: { phone: string }) {
    await this.authService.requestOtp(body.phone);
    return { message: 'OTP sent via WhatsApp' };
  }

  @Post('otp/verify')
  async verifyOtp(@Body() body: { phone: string, code: string }) {
    return this.authService.verifyOtp(body.phone, body.code);
  }
}
`,

  // Module
  'apps/api/src/modules/identity/identity.module.ts': `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './interface/auth.controller';
import { AuthService } from './application/auth.service';
import { TwilioSmsService } from './infrastructure/twilio-sms.service';
import { SMS_SERVICE } from './domain/interfaces/sms.service.interface';
import { JwtStrategy } from '../../shared-kernel/strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: SMS_SERVICE,
      useClass: TwilioSmsService,
    },
  ],
})
export class IdentityModule {}
`,

  'apps/api/src/app.module.ts': `import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { IdentityModule } from './modules/identity/identity.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    IdentityModule,
  ],
})
export class AppModule {}
`,
  'apps/api/src/main.ts': `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
`
};

Object.entries(files).forEach(([filepath, content]) => {
  const absolutePath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
});

console.log('NestJS scaffolding complete');
