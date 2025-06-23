export class LoadBalancerService {
  private targets: { [service: string]: string[] } = {};
  private index: { [service: string]: number } = {};

  public async getTarget(service: string): Promise<{ url: string }> {
    const list = this.targets[service] || [service];
    if (!this.index[service]) this.index[service] = 0;
    const idx = this.index[service];
    this.index[service] = (idx + 1) % list.length;
    return { url: list[idx] || '' };
  }

  public async addTarget(service: string, url: string): Promise<void> {
    if (!this.targets[service]) this.targets[service] = [];
    this.targets[service].push(url);
  }
} 