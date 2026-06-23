import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { DriversModule } from './drivers/drivers.module';
import { RidesModule } from './rides/rides.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Load the .env file
    ConfigModule.forRoot({ isGlobal: true }),

    // Connect to PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true, // Automatically loads our database tables
      synchronize: true, // Auto-creates tables (Great for dev, turn off in production)
    }),

    UsersModule,
    DriversModule,
    RidesModule,
    AuthModule,
  ],
})
export class AppModule {}
