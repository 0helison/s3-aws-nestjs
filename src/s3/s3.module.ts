import { Module } from '@nestjs/common';
import { S3Controller } from './s3.controller';
import { S3UploadService } from './upload.service';

@Module({
  providers: [S3UploadService],
  controllers: [S3Controller],
})
export class S3Module {}
