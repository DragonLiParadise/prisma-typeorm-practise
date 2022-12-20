export type databaseConfig = {
  default?: string;
  connections?: Map<string, databaseConnectionConfig>
}

export type databaseConnectionConfig = {
  driver?: string,
  name?: string,
  database?: string,
  schema?: string,
  url?: string,
  host?: string,
  port?: number,
  username?: string,
  password?: string,
  prefix?: string,
  read?: databaseConnectionConfig[] | databaseConnectionConfig,
  write?: databaseConnectionConfig[] | databaseConnectionConfig
}