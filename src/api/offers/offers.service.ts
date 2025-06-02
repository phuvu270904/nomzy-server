import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { OfferEntity } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(OfferEntity)
    private readonly offerRepository: Repository<OfferEntity>,
  ) {}

  async findAll(): Promise<OfferEntity[]> {
    return this.offerRepository.find();
  }

  async findActive(): Promise<OfferEntity[]> {
    const now = new Date();
    return this.offerRepository.find({
      where: [
        { 
          isActive: true, 
          startDate: IsNull(), 
          endDate: IsNull() 
        },
        {
          isActive: true,
          startDate: IsNull(),
          endDate: MoreThanOrEqual(now),
        },
        {
          isActive: true,
          startDate: LessThanOrEqual(now),
          endDate: IsNull(),
        },
        {
          isActive: true,
          startDate: LessThanOrEqual(now),
          endDate: MoreThanOrEqual(now),
        },
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<OfferEntity> {
    const offer = await this.offerRepository.findOne({
      where: { id },
    });
    
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    
    return offer;
  }

  async create(createOfferDto: CreateOfferDto): Promise<OfferEntity> {
    const newOffer = this.offerRepository.create(createOfferDto);
    return this.offerRepository.save(newOffer);
  }

  async update(id: number, updateOfferDto: UpdateOfferDto): Promise<OfferEntity> {
    const offer = await this.findOne(id);
    
    const updatedOffer = Object.assign(offer, updateOfferDto);
    return this.offerRepository.save(updatedOffer);
  }

  async remove(id: number): Promise<void> {
    const result = await this.offerRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
  }
}
