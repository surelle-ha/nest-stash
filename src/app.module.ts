import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  RedisDriver,
  MemoryDriver,
  FileDriver,
  DatabaseDriver,
} from './app.driver';
import { CacheDriver, ElevenCacheModuleOptions } from './app.interface';
import { ElevenCacheService } from './app.service';

@Global()
@Module({})
export class ElevenCacheModule {
  static forRoot(options: ElevenCacheModuleOptions): DynamicModule {
    const DRIVER_TOKEN = `ELEVEN_CACHE_DRIVER::${options.driver.toUpperCase()}`;

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
      provide: `ELEVEN_CACHE_${options.driver.toUpperCase()}_DRIVER`,
      useFactory: (driver: CacheDriver) => new ElevenCacheService(driver),
      inject: [DRIVER_TOKEN],
    };

    return {
      module: ElevenCacheModule,
      providers: [driverProvider, cacheServiceProvider],
      exports: [cacheServiceProvider],
    };
  }
}
