import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqsController } from './faqs.controller';
import { FaqsService } from './faqs.service';
import { FaqEntity } from './entities/faq.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FaqEntity])],
  controllers: [FaqsController],
  providers: [FaqsService],
  exports: [FaqsService],
})
export class FaqsModule {}
