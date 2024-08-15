import { resolveNs } from 'dns/promises';

export async function checkDNSServer(
  domain: string,
  nameservers: string | string[],
): Promise<boolean> {
  try {
    const ns = await resolveNs(domain);
    return typeof nameservers === 'string'
      ? nameservers
          .replace(/\s+/g, '')
          .split(',')
          .some((n) => ns.indexOf(n) !== -1)
      : nameservers.some((n) => ns.indexOf(n) !== -1);
  } catch (e) {
    return false;
  }
}
