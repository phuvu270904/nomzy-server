import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponEntity } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<CouponEntity> {
    const coupon = this.couponRepository.create(createCouponDto);
    return this.couponRepository.save(coupon);
  }

  async findAll(): Promise<CouponEntity[]> {
    return this.couponRepository.find();
  }

  async findAllGlobal(): Promise<CouponEntity[]> {
    return this.couponRepository.find({
      where: { isGlobal: true, isActive: true },
    });
  }

  async findOne(id: number): Promise<CouponEntity> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async findByCode(code: string): Promise<CouponEntity> {
    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }
    return coupon;
  }

  async update(
    id: number,
    updateCouponDto: UpdateCouponDto,
  ): Promise<CouponEntity> {
    const coupon = await this.findOne(id);
    Object.assign(coupon, updateCouponDto);
    return this.couponRepository.save(coupon);
  }

  async incrementUsageCount(id: number): Promise<CouponEntity> {
    const coupon = await this.findOne(id);
    coupon.usageCount += 1;
    return this.couponRepository.save(coupon);
  }

  async remove(id: number): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponRepository.remove(coupon);
  }

  async deactivate(id: number): Promise<CouponEntity> {
    const coupon = await this.findOne(id);
    coupon.isActive = false;
    return this.couponRepository.save(coupon);
  }
}
