import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqEntity, FaqStatus, FaqType } from './entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { SubmitQuestionDto } from './dto/submit-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(FaqEntity)
    private readonly faqRepository: Repository<FaqEntity>,
  ) {}

  /**
   * Create a new FAQ (by admin - status will be replied)
   */
  async create(createFaqDto: CreateFaqDto): Promise<FaqEntity> {
    const newFaq = this.faqRepository.create({
      ...createFaqDto,
      status: FaqStatus.REPLIED,
      repliedAt: new Date(),
    });
    return await this.faqRepository.save(newFaq);
  }

  /**
   * Submit a question (public - status will be pending)
   */
  async submitQuestion(submitQuestionDto: SubmitQuestionDto): Promise<FaqEntity> {
    const newQuestion = this.faqRepository.create({
      question: submitQuestionDto.question,
      type: submitQuestionDto.type,
      status: FaqStatus.PENDING,
      isActive: true,
    });
    return await this.faqRepository.save(newQuestion);
  }

  /**
   * Answer a question (by admin - update status to replied)
   */
  async answerQuestion(id: number, answerQuestionDto: AnswerQuestionDto): Promise<FaqEntity> {
    const faq = await this.findOne(id);

    faq.answer = answerQuestionDto.answer;
    faq.status = FaqStatus.REPLIED;
    faq.repliedAt = new Date();

    return await this.faqRepository.save(faq);
  }

  /**
   * Get all FAQs, optionally filtered by active status
   */
  async findAll(type?: FaqType): Promise<FaqEntity[]> {
    const query = this.faqRepository.createQueryBuilder('faq');

    if (type) {
      query.where('faq.type = :type', { type });
    }

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
