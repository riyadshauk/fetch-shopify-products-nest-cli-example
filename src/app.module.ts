import { Module } from '@nestjs/common';
import { FindProductsService } from './findproducts.service';
import { FindProductsCommand } from './findproducts.command';
import { ConfigModule } from '@nestjs/config';
import { ShopifyAdminService } from './shopifyadmin.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [FindProductsService, FindProductsCommand, ShopifyAdminService],
})
export class AppModule {}
