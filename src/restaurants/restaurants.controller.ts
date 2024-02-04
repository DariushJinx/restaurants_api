import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/schemas/user.schema';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get()
  async getAllRestaurants(@Query() query: ExpressQuery): Promise<Restaurant[]> {
    return this.restaurantsService.findAll(query);
  }

  @Post()
  @UseGuards(AuthGuard())
  async createRestaurant(
    @Body()
    restaurant: CreateRestaurantDto,
    @CurrentUser() user: User,
  ): Promise<Restaurant> {
    console.log('restaurant:', restaurant);
    return this.restaurantsService.create(restaurant, user);
  }

  @Get(':id')
  async getRestaurant(
    @Param('id')
    id: string,
  ): Promise<Restaurant> {
    return this.restaurantsService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async updateRestaurant(
    @Param('id')
    id: string,
    @Body()
    restaurant: UpdateRestaurantDto,
    @CurrentUser() user: User,
  ): Promise<Restaurant> {
    const res = await this.restaurantsService.findById(id);

    if (res.user.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can not update this restaurant.');
    }

    return this.restaurantsService.updateById(id, restaurant);
  }

  @Delete(':id')
  async deleteRestaurant(
    @Param('id')
    id: string,
  ): Promise<{ deleted: boolean }> {
    await this.restaurantsService.findById(id);

    const restaurant = this.restaurantsService.deleteById(id);

    if (restaurant) {
      return {
        deleted: true,
      };
    }
  }
}
