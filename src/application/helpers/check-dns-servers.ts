import { resolveNs } from 'dns/promises';

export async function checkDNSServer(domain: string): Promise<boolean> {
  try {
    const ns = await resolveNs(domain);
    console.log(ns);
    return this.nameservers.some((n) => ns.indexOf(n) !== -1);
  } catch (e) {
    return false;
  }
}
