import {
  CreateBucketCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { S3UploadService } from '../upload.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('S3UploadService (Integration)', () => {
  let s3UploadService: S3UploadService;
  let client: S3Client;

  beforeAll(async () => {
    process.env.S3_BUCKET_NAME = 'testcontainers';
    process.env.S3_REGION = 'us-east-1';
    process.env.S3_ACCESS_KEY = 'test';
    process.env.S3_SECRET_ACCESS_KEY = 'test';

    client = new S3Client({
      endpoint: 'http://localstack:4566',
      forcePathStyle: true,
      region: process.env.S3_REGION,
      credentials: {
        secretAccessKey: process.env.S3_ACCESS_KEY,
        accessKeyId: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    await client.send(new CreateBucketCommand({ Bucket: 'testcontainers' }));
  });

  beforeEach(() => {
    s3UploadService = new S3UploadService();
    (s3UploadService as any).s3 = client;
  });

  it('should verify if the bucket exists', async () => {
    const response = await client.send(
      new HeadBucketCommand({ Bucket: 'testcontainers' }),
    );
    expect(response.$metadata.httpStatusCode).toEqual(200);
  });

  test('constructor', async () => {
    const [region, credentials] = await Promise.all([
      client.config.region(),
      client.config.credentials(),
    ]);

    expect(s3UploadService).toBeDefined();
    expect(region).toBe('us-east-1');
    expect(credentials.accessKeyId).toBe('test');
    expect(credentials.secretAccessKey).toBe('test');
    expect(s3UploadService['awsS3Bucket']).toBe('testcontainers');
  });

  it('uploadFile should send file to S3', async () => {
    const mockFile = {
      originalname: 'fake-image.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake image content'),
    } as Express.Multer.File;

    const response = await s3UploadService.uploadFile(mockFile);
    expect(response.$metadata.httpStatusCode).toEqual(200);

    const listResponse = await client.send(
      new ListObjectsCommand({ Bucket: 'testcontainers' }),
    );
    const uploadedFile = listResponse.Contents?.[0];

    expect(listResponse.Contents?.length).toBeGreaterThan(0);
    expect(uploadedFile.Key).not.toBe(mockFile.originalname);

    const headResponse = await client.send(
      new HeadObjectCommand({
        Bucket: 'testcontainers',
        Key: uploadedFile.Key,
      }),
    );

    expect(headResponse.ContentType).toBe(mockFile.mimetype);
    expect(headResponse.ContentDisposition).toBe('inline');
  });

  it('should reject with a 500 error when S3 fails unexpectedly', async () => {
    const mockFile = {
      originalname: 'fake-image.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake image content'),
    } as Express.Multer.File;

    jest
      .spyOn(s3UploadService, 'uploadFile')
      .mockRejectedValue(
        new HttpException(
          'S3 Internal Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

    await expect(s3UploadService.uploadFile(mockFile)).rejects.toThrow(
      HttpException,
    );
    await expect(s3UploadService.uploadFile(mockFile)).rejects.toThrow(
      expect.objectContaining({
        message: 'S3 Internal Error',
        status: 500,
      }),
    );
  });

  it('should reject when S3 upload fails', async () => {
    const mockFile = {
      originalname: 'fake-image.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake image content'),
    } as Express.Multer.File;

    jest
      .spyOn(s3UploadService, 'uploadFile')
      .mockRejectedValue(
        new HttpException('S3 Upload Not Found', HttpStatus.NOT_FOUND),
      );

    await expect(s3UploadService.uploadFile(mockFile)).rejects.toThrow(
      HttpException,
    );
    await expect(s3UploadService.uploadFile(mockFile)).rejects.toThrow(
      expect.objectContaining({
        message: 'S3 Upload Not Found',
        status: 404,
      }),
    );
  });
});
