import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getEnvFilePaths } from '../../../src/config/env-file-paths';
import { envValidationSchema } from '../../../src/config/env.validation';
import { DatabaseModule } from '../../../src/database/database.module';
import { StorageModule } from '../../../src/storage/storage.module';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePaths('admin-dashboard'),
      validationSchema: envValidationSchema,
    }),
    DatabaseModule,
    StorageModule,
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
