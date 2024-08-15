import { checkDNSServer } from './check-dns-servers';
import { resolveNs } from 'dns/promises';

jest.mock('dns/promises', () => ({
  resolveNs: jest.fn(),
}));

describe('checkDNSServer', () => {
  const mockedResolveNs = resolveNs as jest.MockedFunction<typeof resolveNs>;

  it('should return true when the nameserver is in the resolved nameservers', async () => {
    // Arrange
    const domain = 'example.com';
    const nameserver = 'ns1.example.com';
    mockedResolveNs.mockResolvedValue([nameserver, 'ns2.example.com']);

    // Act
    const result = await checkDNSServer(domain, nameserver);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false when the nameserver is not in the resolved nameservers', async () => {
    // Arrange
    const domain = 'example.com';
    const nameserver = 'ns3.example.com';
    mockedResolveNs.mockResolvedValue(['ns1.example.com', 'ns2.example.com']);

    // Act
    const result = await checkDNSServer(domain, nameserver);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when resolveNs throws an error', async () => {
    // Arrange
    const domain = 'example.com';
    const nameserver = 'ns1.example.com';
    mockedResolveNs.mockRejectedValue(new Error('DNS error'));

    // Act
    const result = await checkDNSServer(domain, nameserver);

    // Assert
    expect(result).toBe(false);
  });
});
