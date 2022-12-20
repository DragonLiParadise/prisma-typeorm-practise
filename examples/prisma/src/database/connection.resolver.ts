import {PrismaClient} from "@prisma/client";

export class ConnectionResolver {
  protected connections: Map<string, PrismaClient> = new Map<string, PrismaClient>();

  protected default: string = '';

  public connection(name?: string) {
    if (!name) {
      name = this.getDefaultConnection();
    }

    return this.connections.get(name!);
  }

  public addConnection(name: string, connection: PrismaClient) {
    this.connections.set(name, connection);
  }

  public hasConnection(name: string): boolean {
    return this.connections.has(name);
  }

  public getDefaultConnection(): string {
    return this.default;
  }

  public setDefaultConnection(name: string) {
    this.default = name;
    return this;
  }
}