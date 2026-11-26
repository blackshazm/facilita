import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';

export interface AlertPayload {
  timestamp: string;
  environment: string;
  method: string;
  path: string;
  statusCode: number;
  message: string;
  stack?: string;
  ip: string;
  userId?: string;
  sanitizedBody?: any;
}

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  // Debounce cache: hash -> lastSentTimestamp
  private readonly alertThrottleMap = new Map<string, number>();
  private readonly THROTTLE_MS = 5 * 60 * 1000; // 5 minutos por erro idêntico

  private readonly sensitiveKeys = new Set([
    'password',
    'senha',
    'token',
    'secret',
    'authorization',
    'creditcard',
    'cardnumber',
    'cvv',
    'cardtoken',
    'refreshtoken',
  ]);

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: any }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object' && (exceptionResponse as any)?.message
          ? (exceptionResponse as any).message
          : exception.message;
      stack = exception.stack;
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    // Se for erro crítico não tratado (>= 500)
    if (status >= 500) {
      const path = request.url || 'unknown';
      const method = request.method || 'unknown';
      const ip = request.ip || request.socket?.remoteAddress || 'unknown';
      const userId = request.user?.id || request.user?.userId || 'ANONYMOUS';
      const sanitizedBody = this.sanitizeData(request.body);

      this.logger.error(
        `[CRITICAL 500] ${method} ${path} - User: ${userId} - IP: ${ip} - Error: ${message}`,
        stack,
      );

      const alertPayload: AlertPayload = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        method,
        path,
        statusCode: status,
        message,
        stack: stack ? stack.split('\n').slice(0, 5).join('\n') : undefined,
        ip,
        userId,
        sanitizedBody,
      };

      // Dispara alertas externos em background (sem travar resposta HTTP)
      this.dispatchAlerts(alertPayload).catch(err => {
        this.logger.warn(`Falha ao disparar webhook de alerta: ${err.message}`);
      });
    }

    // Envia resposta segura ao cliente sem vazar stack traces
    if (!response.headersSent) {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: status >= 500 ? 'Erro interno no servidor. Nossa equipe de engenharia foi notificada.' : message,
      });
    }
  }

  /**
   * Envia alertas para Discord e/ou Telegram com controle de throttle
   */
  async dispatchAlerts(payload: AlertPayload): Promise<void> {
    const throttleKey = `${payload.method}:${payload.path}:${payload.message}`;
    const lastSent = this.alertThrottleMap.get(throttleKey);
    const now = Date.now();

    if (lastSent && now - lastSent < this.THROTTLE_MS) {
      this.logger.debug(`[Alert Throttle] Alerta duplicado suprimido para: ${throttleKey}`);
      return;
    }

    this.alertThrottleMap.set(throttleKey, now);

    // Limpeza de cache antigo
    if (this.alertThrottleMap.size > 200) {
      for (const [key, timestamp] of this.alertThrottleMap.entries()) {
        if (now - timestamp > this.THROTTLE_MS) {
          this.alertThrottleMap.delete(key);
        }
      }
    }

    const discordWebhookUrl = process.env.ALERT_DISCORD_WEBHOOK_URL;
    const telegramBotToken = process.env.ALERT_TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.ALERT_TELEGRAM_CHAT_ID;

    const alertPromises: Promise<any>[] = [];

    if (discordWebhookUrl) {
      alertPromises.push(this.sendDiscordAlert(discordWebhookUrl, payload));
    }

    if (telegramBotToken && telegramChatId) {
      alertPromises.push(this.sendTelegramAlert(telegramBotToken, telegramChatId, payload));
    }

    if (alertPromises.length > 0) {
      await Promise.allSettled(alertPromises);
    }
  }

  private async sendDiscordAlert(webhookUrl: string, payload: AlertPayload): Promise<void> {
    const discordEmbed = {
      username: 'FACILITA Incident Sentinel',
      avatar_url: 'https://raw.githubusercontent.com/facilita/assets/main/bot-avatar.png',
      embeds: [
        {
          title: `🚨 [ERRO 500] Falha Crítica em ${payload.method} ${payload.path}`,
          color: 0xff0000, // Vermelho Alerta
          fields: [
            { name: 'Ambiente', value: payload.environment, inline: true },
            { name: 'Status', value: String(payload.statusCode), inline: true },
            { name: 'Usuário', value: payload.userId || 'N/A', inline: true },
            { name: 'Mensagem', value: `\`\`\`${payload.message}\`\`\`` },
            {
              name: 'Stack Trace Resumido',
              value: payload.stack ? `\`\`\`${payload.stack}\`\`\`` : 'Sem stack trace',
            },
          ],
          footer: { text: `FACILITA Monitoring • ${payload.timestamp}` },
        },
      ],
    };

    await axios.post(webhookUrl, discordEmbed, { timeout: 4000 });
  }

  private async sendTelegramAlert(token: string, chatId: string, payload: AlertPayload): Promise<void> {
    const text =
      `🚨 *[FACILITA ALERTA CRÍTICO 500]*\n\n` +
      `*Ambiente:* ${payload.environment}\n` +
      `*Rota:* \`${payload.method} ${payload.path}\`\n` +
      `*Status:* ${payload.statusCode}\n` +
      `*Usuário:* \`${payload.userId}\`\n` +
      `*Erro:* \`${payload.message}\`\n` +
      (payload.stack ? `\n*Stack:*\n\`\`\`${payload.stack}\`\`\`` : '');

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }, { timeout: 4000 });
  }

  /**
   * Sanitização recursiva contra vazamento de PII e credenciais
   */
  sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(item => this.sanitizeData(item));

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.sensitiveKeys.has(key.toLowerCase())) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
