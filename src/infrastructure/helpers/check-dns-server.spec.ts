import { resolveNs } from 'dns/promises';
import { checkDNSServer } from './check-dns-servers';

jest.mock('dns/promises', () => ({
  resolveNs: jest.fn(),
}));

describe('checkDNSServer', () => {
  const mockResolveNs = resolveNs as jest.MockedFunction<typeof resolveNs>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if the nameserver is found in the resolved nameservers (string input)', async () => {
    mockResolveNs.mockResolvedValue(['ns1.example.com', 'ns2.example.com']);

    const result = await checkDNSServer('example.com', 'ns1.example.com');
    expect(result).toBe(true);
  });

  it('should return true if the nameserver is found in the resolved nameservers (array input)', async () => {
    mockResolveNs.mockResolvedValue(['ns1.example.com', 'ns2.example.com']);

    const result = await checkDNSServer('example.com', ['ns2.example.com']);
    expect(result).toBe(true);
  });

  it('should return false if the nameserver is not found in the resolved nameservers', async () => {
    mockResolveNs.mockResolvedValue(['ns1.example.com', 'ns2.example.com']);

    const result = await checkDNSServer('example.com', 'ns3.example.com');
    expect(result).toBe(false);
  });

  it('should return false if resolveNs throws an error', async () => {
    mockResolveNs.mockRejectedValue(new Error('DNS resolution failed'));

    const result = await checkDNSServer('example.com', 'ns1.example.com');
    expect(result).toBe(false);
  });

  it('should handle multiple nameservers in a string and return true if any match', async () => {
    mockResolveNs.mockResolvedValue(['ns1.example.com', 'ns2.example.com']);

    const result = await checkDNSServer(
      'example.com',
      'ns3.example.com, ns2.example.com',
    );
    expect(result).toBe(true);
  });

  it('should handle multiple nameservers in an array and return true if any match', async () => {
    mockResolveNs.mockResolvedValue(['ns1.example.com', 'ns2.example.com']);

    const result = await checkDNSServer('example.com', [
      'ns3.example.com',
      'ns2.example.com',
    ]);
    expect(result).toBe(true);
  });

  it('should return false if no nameservers match in the array', async () => {
    mockResolveNs.mockResolvedValue(['ns1.example.com', 'ns2.example.com']);

    const result = await checkDNSServer('example.com', [
      'ns3.example.com',
      'ns4.example.com',
    ]);
    expect(result).toBe(false);
  });

  it('should trim whitespace from string input before matching', async () => {
    mockResolveNs.mockResolvedValue(['ns1.example.com', 'ns2.example.com']);

    const result = await checkDNSServer(
      'example.com',
      '  ns1.example.com  ,  ns2.example.com ',
    );
    expect(result).toBe(true);
  });
});
