declare module 'pg' {
  export type ClientConfig = {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
  };

  export class Client {
    constructor(config?: ClientConfig);
    connect(): Promise<void>;
    query(sql: string): Promise<unknown>;
    end(): Promise<void>;
  }
}
