import { Test, TestingModule } from '@nestjs/testing';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { getModelToken } from '@nestjs/mongoose';
import { Meal } from './schemas/meal.schema';
import { UserRoles } from '../auth/schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { Restaurant } from '../restaurants/schemas/restaurant.schema';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

const mockMeal = {
  _id: '65c74e24412a16bca544397f',
  name: 'first meal',
  description: 'first description',
  price: 1000,
  category: 'Pasta',
  restaurant: '65c2788b9b99138676706dd4',
  user: '65c2767b02b4df6609324578',
  createdAt: '2024-02-10T10:21:24.240Z',
  updatedAt: '2024-02-10T10:21:24.240Z',
  __v: 0,
};

const mockUser = {
  _id: '65c2767b02b4df6609324578',
  email: 'ghulam1@gmail.com',
  name: 'Ghulam',
  role: UserRoles.USER,
};

const mockMealService = {
  findAll: jest.fn().mockResolvedValueOnce([mockMeal]),
  findById: jest.fn().mockResolvedValueOnce(mockMeal),
  create: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn().mockResolvedValueOnce({ deleted: true }),
};

describe('MealController', () => {
  let controller: MealController;
  let service: MealService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [MealController],
      providers: [
        MealService,
        {
          provide: getModelToken(Meal.name),
          useValue: mockMealService,
        },
        {
          provide: getModelToken(Restaurant.name),
          useValue: {},
        },
      ],
    }).compile();
    controller = module.get<MealController>(MealController);
    service = module.get<MealService>(MealService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find all meals', () => {
    it('should find all meals', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve([mockMeal] as any));
      const result: Meal[] = await controller.getAllMeals();
      expect(result).toEqual([mockMeal] as any);
    });
  });

  describe('find one meal by id', () => {
    it('should find one meal by id', async () => {
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockMeal as any);
      jest
        .spyOn(service, 'findById')
        .mockImplementation(() => Promise.resolve(mockMeal as any));
      const result: Meal = await controller.getMeal(mockMeal._id);
      expect(result).toEqual(mockMeal as any);
    });
  });

  describe('create meal', () => {
    it('should create meal', async () => {
      const createMealDto = {
        _id: '65c74e24412a16bca544397f',
        name: 'first meal',
        description: 'first description',
        price: 1000,
        category: 'Pasta',
        restaurant: '65c2788b9b99138676706dd4',
        user: '65c2767b02b4df6609324578',
      };
      jest
        .spyOn(service, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockMeal as any));
      const result: Meal = await controller.createMeal(
        createMealDto as any,
        mockUser._id as any,
      );
      expect(result).toEqual(mockMeal as any);
    });
  });

  describe('find meals by restaurant id', () => {
    it('should find meals by restaurant id', async () => {
      jest
        .spyOn(service, 'findByRestaurant')
        .mockImplementation(() => Promise.resolve([mockMeal] as any));
      const result: Meal[] = await controller.getMealsByRestaurant(
        mockMeal._id,
      );
      expect(result).toEqual([mockMeal] as any);
    });
  });

  describe('updateMeal', () => {
    const meal = { ...mockMeal, name: 'Updated name' };
    const updateMeal = { name: 'Updated name' };

    it('updateMeal', async () => {
      mockMealService.findById = jest.fn().mockReturnValueOnce(mockMeal);
      jest
        .spyOn(service, 'updateById')
        .mockImplementation(() => Promise.resolve(meal as any));

      const result = await controller.updateMeal(
        updateMeal as any,
        mockMeal._id,
        mockUser as any,
      );

      expect(service.updateById).toHaveBeenCalled();
      expect(result).toEqual(meal);
    });

    it('should throw wrong moongose id error', async () => {
      await expect(service.findById('wrongId')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw forbidden error', async () => {
      jest
        .spyOn(service, 'findById')
        .mockImplementation(() => Promise.resolve(mockMeal as any));

      const user = {
        ...mockUser,
        _id: '61c0ccf11d7bf83d153d7c07',
      };

      await expect(
        controller.updateMeal(meal._id as any, updateMeal as any, user as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteMeal', () => {
    it('should delete meal by id', async () => {
      mockMealService.findById = jest.fn().mockReturnValueOnce(mockMeal);
      jest
        .spyOn(service, 'deleteById')
        .mockImplementationOnce(() => Promise.resolve(mockMeal._id as any));

      const result = await controller.deleteMeal(mockMeal._id, mockUser as any);

      expect(service.deleteById).toHaveBeenCalled();
      expect(result).toEqual(mockMeal._id);
    });

    it('should throw wrong moongose id error', async () => {
      await expect(service.findById('wrongId')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw forbidden error', async () => {
      jest
        .spyOn(service, 'findById')
        .mockImplementation(() => Promise.resolve(mockMeal as any));

      const user = {
        ...mockUser,
        _id: '61c0ccf11d7bf83d153d7c07',
      };

      await expect(
        controller.deleteMeal(mockMeal as any, user as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
