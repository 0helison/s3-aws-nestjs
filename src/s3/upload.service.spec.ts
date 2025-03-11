import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3UploadService } from './upload.service';
import { randomUUID } from 'crypto';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid'),
}));

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue('mocked-s3-response'),
    })),
    PutObjectCommand: jest.fn().mockImplementation((params) => ({
      ...params,
    })),
  };
});

describe('S3UploadService Unit Tests', () => {
  let service: S3UploadService;

  const mockEnv = {
    S3_BUCKET_NAME: 'test-bucket',
    S3_REGION: 'us-east-1',
    S3_ACCESS_KEY: 'test-access-key',
    S3_SECRET_ACCESS_KEY: 'test-secret-key',
  };

  beforeAll(() => {
    process.env = { ...mockEnv };
  });

  beforeEach(() => {
    service = new S3UploadService();
  });

  test('constructor', () => {
    expect(S3Client).toHaveBeenCalledWith({
      region: mockEnv.S3_REGION,
      credentials: {
        accessKeyId: mockEnv.S3_ACCESS_KEY,
        secretAccessKey: mockEnv.S3_SECRET_ACCESS_KEY,
      },
    });

    expect(service['awsS3Bucket']).toBe(mockEnv.S3_BUCKET_NAME);
    expect(service).toBeDefined();
  });

  it('uploadFile should send file to S3', async () => {
    const mockFile = {
      originalname: 'test-file.png',
      buffer: Buffer.from('test-file'),
      mimetype: 'image/png',
    } as Express.Multer.File;

    const uniqueName = `${randomUUID()}-${mockFile.originalname}`;

    const result = await service.uploadFile(mockFile);

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: mockEnv.S3_BUCKET_NAME,
        Key: `images/${uniqueName}`,
        Body: mockFile.buffer,
        ContentType: mockFile.mimetype,
        ContentDisposition: 'inline',
      }),
    );
    expect(PutObjectCommand).toHaveBeenCalledTimes(1);
    expect(service['s3'].send).toHaveBeenCalled();
    expect(uniqueName).toBe('mocked-uuid-test-file.png');
    expect(result).toBe('mocked-s3-response');
  });
});
