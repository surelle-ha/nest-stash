import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  RedisDriver,
  MemoryDriver,
  FileDriver,
  DatabaseDriver,
} from './app.driver';
import { CacheDriver, NestStashModuleOptions } from './app.interface';
import { NestStashService } from './app.service';

@Global()
@Module({})
export class NestStashModule {
  static forRoot(options: NestStashModuleOptions): DynamicModule {
    const DRIVER_TOKEN = `NEST_STASH_DRIVER::${options.driver.toUpperCase()}`;

    const driverProvider: Provider = {
      provide: DRIVER_TOKEN,
      useFactory: () => {
        switch (options.driver) {
          case 'redis':
            return new RedisDriver(options.driverOptions);
          case 'database':
            return new DatabaseDriver(options.driverOptions);
          case 'file':
            return new FileDriver(options.driverOptions);
          case 'memory':
          default:
            return new MemoryDriver(options.driverOptions);
        }
      },
    };

    const cacheServiceProvider: Provider = {
      provide: `NEST_STASH_${options.driver.toUpperCase()}_DRIVER`,
      useFactory: (driver: CacheDriver) => new NestStashService(driver),
      inject: [DRIVER_TOKEN],
    };

    return {
      module: NestStashModule,
      providers: [driverProvider, cacheServiceProvider],
      exports: [cacheServiceProvider],
    };
  }
}
