import { ENotasGatewayAdapter } from './enotas-gateway.adapter';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ENotasGatewayAdapter', () => {
  let adapter: ENotasGatewayAdapter;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return mock externalId when ENOTAS_API_KEY is not set or is MOCK_KEY', async () => {
    delete process.env.ENOTAS_API_KEY;
    adapter = new ENotasGatewayAdapter();

    const result = await adapter.issueInvoice({
      externalId: 'pay_test_123',
      customerName: 'João da Silva',
      customerEmail: 'joao@exemplo.com',
      customerCpfCnpj: '12345678909',
      serviceDescription: 'Troca de torneira',
      totalAmount: 140,
      commissionAmount: 28,
    });

    expect(result.externalId).toMatch(/^en_mock_/);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('should call eNotas API when ENOTAS_API_KEY is configured', async () => {
    process.env.ENOTAS_API_KEY = 'real_api_key_test';
    adapter = new ENotasGatewayAdapter();

    mockedAxios.post.mockResolvedValueOnce({
      data: { id: 'en_live_998877' },
    });

    const result = await adapter.issueInvoice({
      externalId: 'pay_test_456',
      customerName: 'Maria Santos',
      customerEmail: 'maria@exemplo.com',
      customerCpfCnpj: '987.654.321-00',
      serviceDescription: 'Instalação de Chuveiro',
      totalAmount: 180,
      commissionAmount: 36,
      cityServiceCode: '01.01',
    });

    expect(result.externalId).toBe('en_live_998877');
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/vendas'),
      expect.objectContaining({
        cliente: {
          nome: 'Maria Santos',
          email: 'maria@exemplo.com',
          cpfCnpj: '98765432100',
        },
        servico: {
          descricao: 'Instalação de Chuveiro',
          valorTotal: 36,
          codigoServicoMunicipio: '01.01',
        },
        idExterno: 'pay_test_456',
      }),
      expect.any(Object),
    );
  });
});
