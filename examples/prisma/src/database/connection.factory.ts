import {databaseConnectionConfig} from "./database.config.type";
import {PrismaClient} from "@prisma/client";

export class ConnectionFactory {
  public make(config: databaseConnectionConfig, name: string): () => PrismaClient {
    config = this.parseConfig(config, name);

    if (config.read) {
      return this.createReadWriteConnection(config.read as databaseConnectionConfig);
    }

    return this.createReadSingleConnection(config);
  }

  protected parseConfig(config: databaseConnectionConfig, name: string) {
    config.name = name;

    return config;
  }

  protected createReadWriteConnection(config: databaseConnectionConfig) {
    return this.createReadSingleConnection(this.getWriteConfig(config));
  }

  protected getWriteConfig(config: databaseConnectionConfig) {
    return this.mergeReadWriteConfig(
        config,
        this.getReadWriteConfig(config) as databaseConnectionConfig
    );
  }

  protected mergeReadWriteConfig(config: databaseConnectionConfig, merge: databaseConnectionConfig) {
      return {...config, ...merge};
  }

  protected getReadWriteConfig(config: databaseConnectionConfig) {
    return config.write instanceof Array ? (config.write[0] as databaseConnectionConfig) : config.write;
  }

  protected createReadSingleConnection(config: databaseConnectionConfig) {
    return this.createConnectionResolver(config);
  }

  protected createConnectionResolver(config: databaseConnectionConfig) {
    return config.url ? this.createPDOResolverWithUrl(config) : this.createPDOResolverWithoutUrl(config);
  }

  protected createPDOResolverWithoutUrl(config: databaseConnectionConfig) {
    return () => {
      return new PrismaClient({
        datasources: {
          db: {
            url: `${config.schema}://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`,
          }
        }
      })
    }
  }

  protected createPDOResolverWithUrl(config: databaseConnectionConfig) {
    return () => {
      return new PrismaClient({
        datasources: {
          db: {
            url: config.url,
          }
        }
      })
    }
  }
}