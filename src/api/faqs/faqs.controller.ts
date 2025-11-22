import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqEntity, FaqType } from './entities/faq.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@ApiTags('FAQs')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new FAQ' })
  async create(@Body() createFaqDto: CreateFaqDto): Promise<FaqEntity> {
    return this.faqsService.create(createFaqDto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiQuery({
    name: 'type',
    required: false,
    type: 'enum',
    enum: FaqType,
    description: 'Filter FAQs by type',
  })
  async findAll(
    @Query('type') type?: FaqType,
  ): Promise<FaqEntity[]> {
    return this.faqsService.findAll(
      type
    );
  }

  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific FAQ by ID' })
  async findOne(@Param('id') id: number): Promise<FaqEntity> {
    return this.faqsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update an existing FAQ' })
  async update(
    @Param('id') id: number,
    @Body() updateFaqDto: UpdateFaqDto,
  ): Promise<FaqEntity> {
    return this.faqsService.update(+id, updateFaqDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a FAQ' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.faqsService.remove(+id);
  }
}
