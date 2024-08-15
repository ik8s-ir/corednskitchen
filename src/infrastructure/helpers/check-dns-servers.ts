import { resolveNs } from 'dns/promises';

export async function checkDNSServer(
  domain: string,
  nameserver: string,
): Promise<boolean> {
  try {
    const ns = await resolveNs(domain);
    return ns.includes(nameserver);
  } catch (e) {
    return false;
  }
}
