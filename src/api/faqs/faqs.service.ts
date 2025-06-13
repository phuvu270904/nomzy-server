import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqEntity } from './entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(FaqEntity)
    private readonly faqRepository: Repository<FaqEntity>,
  ) {}

  /**
   * Create a new FAQ
   */
  async create(createFaqDto: CreateFaqDto): Promise<FaqEntity> {
    const newFaq = this.faqRepository.create(createFaqDto);
    return await this.faqRepository.save(newFaq);
  }

  /**
   * Get all FAQs, optionally filtered by active status
   */
  async findAll(activeOnly = false): Promise<FaqEntity[]> {
    const query = this.faqRepository.createQueryBuilder('faq');

    if (activeOnly) {
      query.where('faq.isActive = :isActive', { isActive: true });
    }

    query.orderBy('faq.sortOrder', 'ASC');

    return await query.getMany();
  }

  /**
   * Get a specific FAQ by ID
   */
  async findOne(id: number): Promise<FaqEntity> {
    const faq = await this.faqRepository.findOne({ where: { id } });

    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    return faq;
  }

  /**
   * Update an existing FAQ
   */
  async update(id: number, updateFaqDto: UpdateFaqDto): Promise<FaqEntity> {
    const faq = await this.findOne(id);

    // Update the entity with the new data
    Object.assign(faq, updateFaqDto);

    // Save the updated entity
    return this.faqRepository.save(faq);
  }

  /**
   * Delete a FAQ
   */
  async remove(id: number): Promise<void> {
    const faq = await this.findOne(id);
    await this.faqRepository.remove(faq);
  }
}
