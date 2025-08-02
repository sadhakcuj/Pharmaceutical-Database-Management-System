import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StockModule } from './stock/stock.module';
import { ConfigModule } from '@nestjs/config';
import { ProviderModule } from './provider/provider.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OrderModule } from './order/order.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ArchivedOrderModule } from './archived-order/archived-order.module';
import { ReceiptModule } from './receipt/receipt.module';

@Module({
  imports: [
    PrismaModule,
    StockModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ProviderModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    OrderModule,
    UserModule,
    AuthModule,
    MailModule,
    ArchivedOrderModule,
    ReceiptModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
