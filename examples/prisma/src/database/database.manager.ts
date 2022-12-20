import {PrismaClient} from "@prisma/client";
import {ConnectionFactory} from "./connection.factory";
import {databaseConfig, databaseConnectionConfig} from "./database.config.type";

export class DatabaseManager {
  protected factory: ConnectionFactory;

  protected config: databaseConfig;

  protected connections: Map<string, PrismaClient> = new Map<string, PrismaClient>();

  protected extensions: Map<string, () => PrismaClient> = new Map<string, () => PrismaClient>();

  constructor(config: databaseConfig, factory: ConnectionFactory = new ConnectionFactory()) {
    this.config = config;
    this.factory = factory;
  }

  public connection(name?: string): PrismaClient {
    const connectionName = this.parseConnectionName(name);

    const currentDatabase = name || connectionName;

    if (!this.hasConnection(currentDatabase)) {
      this.connections.set(currentDatabase, this.makeConnection(currentDatabase))
    }

    return this.connections.get(currentDatabase) as PrismaClient;
  }

  public hasConnection(name: string): boolean {
    return this.connections.has(name);
  }

  protected makeConnection(name: string) {
      const config = this.configuration(name);

      let resolver: () => PrismaClient;

      if (this.extensions.has(name)) {
        resolver = this.extensions.get(name) as () => PrismaClient;
      } else {
        resolver = this.factory.make(config, name)
      }

      return resolver();
  }

  protected configuration(name?: string) {
    name = name ?? this.getDefaultConnection();

    const connections = this.config.connections;

    if (!connections?.has(name)) {
      throw new Error('database connection not found')
    }

    return connections?.get(name) as databaseConnectionConfig;
  }

  protected parseConnectionName(name?: string): string {
    if (!name) {
      return  this.getDefaultConnection();
    }

    return name;
  }

  public getDefaultConnection(): string {
    return this.config.default as string;
  }
}