import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { RolesGuard } from 'src/roles/roles.guard';

@ApiBearerAuth('access-token')
@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Add a restaurant to favorites' })
  @ApiResponse({
    status: 201,
    description: 'The restaurant has been successfully added to favorites',
    type: FavoriteResponseDto,
  })
  async addToFavorites(
    @Req() req,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ): Promise<FavoriteResponseDto> {
    return this.favoritesService.addToFavorites(req.user.id, createFavoriteDto);
  }

  @Get()
  @Roles(Role.USER)
  @ApiOperation({
    summary: 'Get all favorite restaurants for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of favorite restaurants',
    type: [FavoriteResponseDto],
  })
  async getUserFavorites(@Req() req): Promise<FavoriteResponseDto[]> {
    return this.favoritesService.getUserFavorites(req.user.id);
  }

  @Get('check/:restaurantId')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Check if a restaurant is in favorites' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID to check' })
  @ApiResponse({
    status: 200,
    description: 'Returns true if restaurant is in favorites, false otherwise',
  })
  async checkIsFavorite(
    @Req() req,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ): Promise<{ isFavorite: boolean }> {
    const isFavorite = await this.favoritesService.checkIsFavorite(
      req.user.id,
      restaurantId,
    );
    return { isFavorite };
  }

  @Delete(':restaurantId')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a restaurant from favorites' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID to remove from favorites',
  })
  @ApiResponse({
    status: 204,
    description: 'The restaurant has been successfully removed from favorites',
  })
  async removeFavorite(
    @Req() req,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ): Promise<void> {
    return this.favoritesService.removeFavorite(req.user.id, restaurantId);
  }
}
