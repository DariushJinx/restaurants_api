import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import { AppModule } from './../src/app.module';
import * as request from 'supertest';
import { Category } from '../src/meal/schemas/meal.schema';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(() => mongoose.disconnect());

  const user = {
    name: 'cyrus',
    email: 'cyrus@gmail.com',
    password: 'cyrusJinx',
  };

  const createMealDto = {
    name: 'first meal',
    description: 'first description',
    price: 1000,
    category: Category.PASTA,
    restaurant: '65c2788b9b99138676706dd4',
  };

  let jwtToken: string;
  let mealCreated: any;

  it('(GET) - login user', async () => {
    return request(app.getHttpServer())
      .get('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200)
      .then((res) => {
        expect(res.body.token).toBeDefined();
        jwtToken = res.body.token;
      });
  });

  it('(POST) - creates a new meal', async () => {
    const response = await request(app.getHttpServer())
      .post('/meals')
      .set('Authorization', 'Bearer ' + jwtToken)
      .send(createMealDto);

    expect(response.status).toBe(201);
    expect(response.body._id).toBeDefined();
    expect(response.body.name).toEqual(createMealDto.name);
    mealCreated = response.body;
  });

  it('(GET) - get all meals', async () => {
    return request(app.getHttpServer())
      .get('/meals')
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(8);
      });
  });

  it('(GET) - get restaurant by ID', async () => {
    return request(app.getHttpServer())
      .get(`/meals/${mealCreated._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body._id).toEqual(mealCreated._id);
      });
  });

  it('(PUT) - update meal by ID', async () => {
    return request(app.getHttpServer())
      .put(`/meals/${mealCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken)
      .send({ name: 'Updated name' })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.name).toEqual('Updated name');
      });
  });

  it('(DELETE) - delete restaurant by ID', async () => {
    return request(app.getHttpServer())
      .delete(`/meals/${mealCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.deleted).toEqual(true);
      });
  });
});
