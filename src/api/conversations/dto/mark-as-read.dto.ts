import { IsNotEmpty, IsNumber } from 'class-validator';

export class MarkAsReadDto {
  @IsNotEmpty()
  @IsNumber()
  conversationId: number;
}
