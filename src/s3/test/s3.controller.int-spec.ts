import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { S3Controller } from '../s3.controller';
import { S3UploadService } from '../upload.service';

describe('S3Controller (Integration)', () => {
  let app: INestApplication;
  let s3UploadService: S3UploadService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [S3Controller],
      providers: [
        {
          provide: S3UploadService,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue({ ETag: '"123456789"' }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    s3UploadService = moduleFixture.get<S3UploadService>(S3UploadService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /upload - Deve chamar o serviço e retornar resposta correta', async () => {
    const fileBuffer = Buffer.from('fake image content');

    const response = await request(app.getHttpServer())
      .post('/upload')
      .attach('file', fileBuffer, {
        filename: 'test-image.jpg',
        contentType: 'image/jpeg',
      });

    expect(s3UploadService.uploadFile).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('ETag');
  });
});
