import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import {envValidationSchema} from './config/env.validation';

@Module({
imports:[
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validationSchema: envValidationSchema,
}),
AuthModule,
UsersModule,
RolesModule,
PermissionsModule] 
})
export class AppModule {}
