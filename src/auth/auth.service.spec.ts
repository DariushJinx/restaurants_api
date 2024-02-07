import { Document, Model, ObjectId } from 'mongoose';
import { AuthService } from './auth.service';
import { User, UserRoles } from './schemas/user.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import APIFeatures from '../utils/apiFeatuers.utils';
import * as bcrypt from 'bcryptjs';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockUser = {
  _id: '61c0ccf11d7bf83d153d7c06',
  name: 'Ghulam',
  email: 'ghulam1@gmail.com',
  role: UserRoles.USER,
  password: 'hashedPassword',
};

const token = 'jwtToken';

const mockAuthService = {
  create: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'miaymyemeghdarirohandlemikonim',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto = {
      name: 'Ghulam',
      email: 'ghulam1@gmail.com',
      password: '12345678',
    };

    it('should register a new user', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('testHash');
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() =>
          Promise.resolve([
            mockUser as unknown as Document<unknown, User> &
              User & { _id: ObjectId },
          ]),
        );

      jest.spyOn(APIFeatures, 'assignJwtToken').mockResolvedValueOnce(token);

      const result = await service.signUp(signUpDto);

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result.token).toEqual(token);
    });

    it('should throw duplicate email entered', async () => {
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.reject({ code: 11000 }));

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
