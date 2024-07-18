import { Index } from "@upstash/vector";

export class UpstashService {
  private index;

  private constructor() {
    this.index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL ?? "",
      token: process.env.UPSTASH_VECTOR_REST_TOKEN ?? "",
    });
  }

  static #instance: UpstashService;

  public static get instance(): UpstashService {
    if (!UpstashService.#instance) {
      UpstashService.#instance = new UpstashService();
    }

    return UpstashService.#instance;
  }

  public async resetIndex() {
    await this.index.reset();
  }

  public async upsert(id: number, data: string, metadata: any) {
    await this.index.upsert({
      id,
      data,
      metadata,
    });
  }
}
