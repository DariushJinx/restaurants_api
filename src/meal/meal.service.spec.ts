import { Test, TestingModule } from '@nestjs/testing';
import { Restaurant } from '../restaurants/schemas/restaurant.schema';
import { MealService } from './meal.service';
import { Meal } from './schemas/meal.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRoles } from '../auth/schemas/user.schema';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const mockMeal = {
  _id: '65c74e24412a16bca544397f',
  name: 'first meal',
  description: 'first description',
  price: 1000,
  category: 'Pasta',
  restaurant: '61c4aa2ffaa767823d1687ef',
  user: '65c2767b02b4df6609324578',
};

const mockUser = {
  _id: '65c2767b02b4df6609324578',
  email: 'ghulam1@gmail.com',
  name: 'Ghulam',
  role: UserRoles.USER,
};

const mockRestaurant = {
  user: '65c2767b02b4df6609324578',
  menu: [
    {
      _id: '65c74e24412a16bca544397f',
      name: 'first meal',
      description: 'first description',
      price: 1000,
      category: 'Pasta',
      restaurant: '61c4aa2ffaa767823d1687ef',
      user: '65c2767b02b4df6609324578',
    },
  ],
  location: {
    type: 'Point',
    coordinates: [-77.376204, 38.492151],
    formattedAddress: '200 Olympic Dr, Stafford, VA 22554-7763, US',
    city: 'Stafford',
    state: 'VA',
    zipcode: '22554-7763',
    country: 'US',
  },
  images: [],
  category: 'Fast Food',
  address: '200 Olympic Dr, Stafford, VS, 22554',
  phoneNo: 9788246116,
  email: 'ghulam@gamil.com',
  description: 'This is just a description',
  name: 'Retaurant 4',
  _id: '61c4aa2ffaa767823d1687ef',
  createdAt: '2021-12-23T16:56:15.127Z',
  updatedAt: '2021-12-23T16:56:15.127Z',
  save: jest.fn(),
};

const mockMealService = {
  find: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};
const mockRestaurantsService = {
  findById: jest.fn(),
};

describe('MealService', () => {
  let service: MealService;
  let mealModel: Model<Meal>;
  let RestaurantModel: Model<Restaurant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealService,
        {
          provide: getModelToken(Meal.name),
          useValue: mockMealService,
        },
        {
          provide: getModelToken(Restaurant.name),
          useValue: mockRestaurantsService,
        },
      ],
    }).compile();
    service = module.get<MealService>(MealService);
    mealModel = module.get<Model<Meal>>(getModelToken(Meal.name));
    RestaurantModel = module.get<Model<Restaurant>>(
      getModelToken(Restaurant.name),
    );
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should get all meals', async () => {
      jest.spyOn(mealModel, 'find').mockReturnValueOnce([mockMeal] as any);
      const result = await service.findAll();
      expect(result).toEqual([mockMeal]);
    });
  });

  describe('find one meal by restaurant', () => {
    it('should get one meal by restaurant', async () => {
      jest.spyOn(mealModel, 'find').mockReturnValueOnce([mockMeal] as any);
      const result = await service.findByRestaurant(mockMeal.restaurant);
      expect(result).toEqual([mockMeal]);
    });
  });

  describe('create new meal', () => {
    const newMeal = {
      _id: '65c74e24412a16bca544397f',
      name: 'first meal',
      description: 'first description',
      price: 1000,
      category: 'Pasta',
      restaurant: '61c4aa2ffaa767823d1687ef',
      user: '65c2767b02b4df6609324578',
    };
    it('should create a new meal', async () => {
      jest
        .spyOn(RestaurantModel, 'findById')
        .mockResolvedValueOnce(mockRestaurant as any);
      jest
        .spyOn(mealModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockMeal) as any);

      const result = await service.create(newMeal as any, mockUser as any);

      expect(result).toEqual(newMeal);
      expect(mockRestaurant.save).toHaveBeenCalled();
      expect(mockMealService.create).toHaveBeenCalledWith({
        ...mockMeal,
        user: mockUser._id,
      });
      expect(RestaurantModel.findById).toHaveBeenCalledWith(
        mockMeal.restaurant,
      );
      expect(mockRestaurant.menu).toContain(newMeal._id.toString());
    });
    it('Restaurant not found with this ID.', async () => {
      const mockError = new NotFoundException('restaurant not found');
      jest
        .spyOn(mockRestaurantsService, 'findById')
        .mockRejectedValue(mockError);
      await expect(service.findById(mockMeal.restaurant)).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should throw ForbiddenException if user does not own the restaurant', async () => {
      const mockError = new ForbiddenException(
        'You can not add meal to this restaurant.',
      );
      jest
        .spyOn(mockRestaurantsService, 'findById')
        .mockRejectedValue(mockError);
      await expect(
        service.create(newMeal as any, mockUser as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('find one meal by meal id', () => {
    it('should find one meal by meal id', async () => {
      jest.spyOn(mealModel, 'findById').mockResolvedValueOnce(mockMeal as any);
      const result = await service.findById(mockMeal._id);
      expect(result).toEqual(mockMeal);
    });
    it('should throw wrong moongose id error', async () => {
      await expect(service.findById('wrongId')).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw meal not found error', async () => {
      const mockError = new NotFoundException('meal not found');
      jest.spyOn(mealModel, 'findById').mockRejectedValue(mockError);
      await expect(service.findById(mockMeal._id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('find one meal by id and update with new value', () => {
    it('should update a meal by new value', async () => {
      const meal = { ...mockMeal, name: 'Updated meal' };
      const updateMeal = { name: 'Updated meal' };

      jest
        .spyOn(mealModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(meal as any);

      const updatedMeal = await service.updateById(meal._id, updateMeal as any);
      expect(updatedMeal.name).toEqual(updateMeal.name);
    });
  });

  describe('delete one meal', () => {
    it('should delete one meal by id', async () => {
      jest
        .spyOn(mockMealService, 'findById')
        .mockResolvedValueOnce(mockMeal as any);
      jest
        .spyOn(mockMealService, 'findByIdAndDelete')
        .mockReturnValue(true as any);
      jest
        .spyOn(mockRestaurantsService, 'findById')
        .mockResolvedValueOnce(mockRestaurant as any);

      const result = await service.deleteById(mockMeal._id, mockUser as any);

      expect(result).toEqual({ deleted: true });
      expect(mockMealService.findByIdAndDelete).toHaveBeenCalledWith(
        mockMeal._id,
      );
      expect(mockRestaurantsService.findById).toHaveBeenCalledWith(
        mockMeal.restaurant,
      );
      expect(mockRestaurant.menu).not.toContain(mockMeal._id);
      expect(mockRestaurant.save).toHaveBeenCalled();
    });
    it('should restaurant not found with this id', async () => {
      const mockError = new NotFoundException('restaurant not found');
      jest
        .spyOn(mockRestaurantsService, 'findById')
        .mockRejectedValue(mockError);
      await expect(service.findById(mockMeal.restaurant)).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should throw ForbiddenException if user does not own the restaurant', async () => {
      const mockError = new ForbiddenException(
        'you can not delete this meal from this restaurant',
      );
      jest.spyOn(mockMealService, 'findById').mockResolvedValueOnce(mockMeal);
      jest
        .spyOn(mockRestaurantsService, 'findById')
        .mockRejectedValue(mockError);
      await expect(
        service.deleteById(mockMeal._id, mockUser as any),
      ).rejects.toThrow(ForbiddenException);
    });
    it('should return { deleted: false } if meal deletion fails', async () => {
      jest
        .spyOn(mockMealService, 'findById')
        .mockResolvedValueOnce(mockMeal as any);
      jest
        .spyOn(mockMealService, 'findByIdAndDelete')
        .mockReturnValue(false as any);
      jest
        .spyOn(mockRestaurantsService, 'findById')
        .mockResolvedValueOnce(mockRestaurant as any);

      const result = await service.deleteById(mockMeal._id, mockUser as any);

      expect(result).toEqual({ deleted: false });
    });
  });
});
