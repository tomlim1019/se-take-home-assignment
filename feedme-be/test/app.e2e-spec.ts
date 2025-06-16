import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/add-normal (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/add-normal')
      .send({ id: 'A001' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Normal Order Added' });
  });

  it('/add-vip (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/add-vip')
      .send({ id: 'VIP001' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'VIP Order Added' });
  });

  it('/add-bot (POST)', async () => {
    const response = await request(app.getHttpServer()).post('/add-bot');

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Bot Added' });
  });

  it('/remove-bot (POST)', async () => {
    const response = await request(app.getHttpServer()).post('/remove-bot');

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Bot Removed' });
  });
});
