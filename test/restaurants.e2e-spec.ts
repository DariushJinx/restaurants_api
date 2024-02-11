import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import { AppModule } from './../src/app.module';
import * as request from 'supertest';

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
    name: 'Ghulam Abbas',
    email: 'ghulam@gmail.com',
    password: '12345678',
  };

  const newRestaurant = {
    category: 'Fast Food',
    address: '200 Olympic Dr, Stafford, VS, 22554',
    phoneNo: 9788246116,
    email: 'ghulam@gamil.com',
    description: 'This is just a description',
    name: 'Retaurant 4',
  };

  let jwtToken: string;
  let restaurantCreated: any;

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

  it('(POST) - creates a new restaurant', async () => {
    return request(app.getHttpServer())
      .post('/restaurants')
      .set('Authorization', 'Bearer ' + jwtToken)
      .send(newRestaurant)
      .expect(201)
      .then((res) => {
        expect(res.body._id).toBeDefined();
        expect(res.body.name).toEqual(newRestaurant.name);
        restaurantCreated = res.body;
      });
  });

  it('(GET) - get all restaurants', async () => {
    return request(app.getHttpServer())
      .get('/restaurants')
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(2);
      });
  });

  it('(GET) - get restaurant by ID', async () => {
    return request(app.getHttpServer())
      .get(`/restaurants/${restaurantCreated._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body._id).toEqual(restaurantCreated._id);
      });
  });

  it('(PUT) - update restaurant by ID', async () => {
    return request(app.getHttpServer())
      .put(`/restaurants/${restaurantCreated._id}`)
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
      .delete(`/restaurants/${restaurantCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.deleted).toEqual(true);
      });
  });
});
