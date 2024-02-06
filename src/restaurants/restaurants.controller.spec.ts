import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsService } from './restaurants.service';
import { PassportModule } from '@nestjs/passport';
import { RestaurantsController } from './restaurants.controller';
import { UserRoles } from '../auth/schemas/user.schema';
import { ForbiddenException } from '@nestjs/common';

const mockRestaurant = {
  user: '61c0ccf11d7bf83d153d7c06',
  menu: [],
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
};

const mockUser = {
  _id: '61c0ccf11d7bf83d153d7c06',
  email: 'ghulam1@gmail.com',
  name: 'Ghulam',
  role: UserRoles.USER,
};

const mockRestaurantService = {
  findAll: jest.fn().mockResolvedValueOnce([mockRestaurant]),
  create: jest.fn(),
  findById: jest.fn().mockResolvedValueOnce(mockRestaurant),
  updateById: jest.fn(),
  deleteById: jest.fn().mockResolvedValueOnce({ deleted: true }),
};

describe('RestaurantsController', () => {
  let controller: RestaurantsController;
  let service: RestaurantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [RestaurantsController],
      providers: [
        {
          provide: RestaurantsService,
          useValue: mockRestaurantService,
        },
      ],
    }).compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
    service = module.get<RestaurantsService>(RestaurantsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllRestaurants', () => {
    it('should get all restaurnts', async () => {
      const result = await controller.getAllRestaurants({
        keyword: 'restaurant',
      });

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockRestaurant]);
    });
  });

  describe('createRestaurant', () => {
    it('should create a new restaurant', async () => {
      const newRestaurant = {
        category: 'Fast Food',
        address: '200 Olympic Dr, Stafford, VS, 22554',
        phoneNo: 9788246116,
        email: 'ghulam@gamil.com',
        description: 'This is just a description',
        name: 'Retaurant 4',
      };

      mockRestaurantService.create = jest
        .fn()
        .mockResolvedValueOnce(mockRestaurant);

      const result = await controller.createRestaurant(
        newRestaurant as any,
        mockUser as any,
      );

      expect(service.create).toHaveBeenCalled();
      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('getRestaurantById', () => {
    it('should get restaurant by ID', async () => {
      const result = await controller.getRestaurant(mockRestaurant._id);

      expect(service.findById).toHaveBeenCalled();
      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('updateRestaurant', () => {
    const restaurant = { ...mockRestaurant, name: 'Updated name' };
    const updateRestaurant = { name: 'Updated name' };

    it('should update restaurant by ID', async () => {
      mockRestaurantService.findById = jest
        .fn()
        .mockResolvedValueOnce(mockRestaurant);

      mockRestaurantService.updateById = jest
        .fn()
        .mockResolvedValueOnce(restaurant);

      const result = await controller.updateRestaurant(
        restaurant._id,
        updateRestaurant as any,
        mockUser as any,
      );

      expect(service.updateById).toHaveBeenCalled();
      expect(result).toEqual(restaurant);
      expect(result.name).toEqual(restaurant.name);
    });

    it('should throw forbidden error', async () => {
      mockRestaurantService.findById = jest
        .fn()
        .mockResolvedValueOnce(mockRestaurant);

      const user = {
        ...mockUser,
        _id: '61c0ccf11d7bf83d153d7c07',
      };

      await expect(
        controller.updateRestaurant(
          restaurant._id,
          updateRestaurant as any,
          user as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteRestaurant', () => {
    it('should delete restaurant by ID', async () => {
      mockRestaurantService.findById = jest
        .fn()
        .mockResolvedValueOnce(mockRestaurant);

      const result = await controller.deleteRestaurant(
        mockRestaurant._id,
        mockUser as any,
      );

      expect(service.deleteById).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });

    it('should throw forbidden error', async () => {
      mockRestaurantService.findById = jest
        .fn()
        .mockResolvedValueOnce(mockRestaurant);

      const user = {
        ...mockUser,
        _id: '61c0ccf11d7bf83d153d7c07',
      };

      await expect(
        controller.deleteRestaurant(mockRestaurant._id, user as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
