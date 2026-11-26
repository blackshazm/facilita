import { GlobalExceptionFilter } from './global-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  beforeEach(() => {
    jest.clearAllMocks();
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      headersSent: false,
    };

    mockRequest = {
      url: '/orders/checkout',
      method: 'POST',
      ip: '127.0.0.1',
      user: { id: 'usr-123' },
      body: {
        orderId: 'ord-1',
        paymentMethod: 'CARD',
        password: 'super-secret-password',
        cardToken: 'tok_12345',
        nested: {
          cvv: '123',
          amount: 5000,
        },
      },
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    delete process.env.ALERT_DISCORD_WEBHOOK_URL;
    delete process.env.ALERT_TELEGRAM_BOT_TOKEN;
    delete process.env.ALERT_TELEGRAM_CHAT_ID;
  });

  it('deve interceptar erro 500 e enviar resposta JSON padronizada sem vazar stack trace ao cliente', async () => {
    const error = new Error('Database connection failed');

    await filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Erro interno no servidor. Nossa equipe de engenharia foi notificada.',
        path: '/orders/checkout',
      }),
    );
  });

  it('não deve disparar alerta de pânico para erros 4xx de cliente (ex: 400 ou 404)', async () => {
    process.env.ALERT_DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
    const error = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    await filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('deve disparar webhook para Discord e Telegram quando configurados em caso de erro 500', async () => {
    process.env.ALERT_DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
    process.env.ALERT_TELEGRAM_BOT_TOKEN = '123456:ABC-DEF';
    process.env.ALERT_TELEGRAM_CHAT_ID = '-10099999';

    mockedAxios.post.mockResolvedValue({ data: 'ok' });

    const error = new Error('Critical Unhandled Exception in Payment Flow');
    await filter.catch(error, mockHost);

    // Espera microtarefas assíncronas do dispatchAlerts
    await new Promise(r => setTimeout(r, 50));

    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test',
      expect.objectContaining({
        username: 'FACILITA Incident Sentinel',
        embeds: expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringContaining('/orders/checkout'),
          }),
        ]),
      }),
      expect.any(Object),
    );
  });

  it('deve sanitizar senhas, cartões e tokens confidenciais antes do disparo do alerta', () => {
    const rawData = {
      username: 'usuario@facilita.com',
      password: 'minha_senha_123',
      creditCard: '4111111111111111',
      cvv: '999',
      subObject: {
        token: 'jwt.token.secret',
        serviceId: 'srv-10',
      },
    };

    const sanitized = filter.sanitizeData(rawData);

    expect(sanitized.username).toBe('usuario@facilita.com');
    expect(sanitized.password).toBe('***REDACTED***');
    expect(sanitized.creditCard).toBe('***REDACTED***');
    expect(sanitized.cvv).toBe('***REDACTED***');
    expect(sanitized.subObject.token).toBe('***REDACTED***');
    expect(sanitized.subObject.serviceId).toBe('srv-10');
  });

  it('deve aplicar throttle e suprimir alertas duplicados para o mesmo erro nos últimos 5 minutos', async () => {
    process.env.ALERT_DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
    mockedAxios.post.mockResolvedValue({ data: 'ok' });

    const error = new Error('Same recurring crash');

    await filter.catch(error, mockHost);
    await filter.catch(error, mockHost); // Duplicado imediato

    await new Promise(r => setTimeout(r, 50));

    // Apenas 1 disparo deve ter ocorrido devido ao throttle
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('não deve quebrar o fluxo HTTP mesmo se a chamada ao webhook falhar com timeout/erro', async () => {
    process.env.ALERT_DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
    mockedAxios.post.mockRejectedValue(new Error('Discord Webhook Outage 503'));

    const error = new Error('Application crash');
    await filter.catch(error, mockHost);

    await new Promise(r => setTimeout(r, 50));

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalled();
  });
});
