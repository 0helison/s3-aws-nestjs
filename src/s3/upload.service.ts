import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class S3UploadService {
  private s3: S3Client;
  private awsS3Bucket: string;

  constructor() {
    this.awsS3Bucket = process.env.S3_BUCKET_NAME;

    this.s3 = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<PutObjectCommandOutput> {
    const uniqueName: string = `${randomUUID()}-${file.originalname}`;

    const command: PutObjectCommand = new PutObjectCommand({
      Bucket: this.awsS3Bucket,
      Key: `images/${uniqueName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: 'inline',
    });

    return this.s3.send(command);
  }
}
