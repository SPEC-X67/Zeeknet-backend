import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { IS3Service } from '../../../application/interfaces';
import { env } from '../../config/env';

export class S3Service implements IS3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: env.AWS_REGION!,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    });
    this.bucketName = env.AWS_S3_BUCKET_NAME!;
  }

  async uploadImage(
    file: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    const key = `company-images/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);
    
    const region = env.AWS_REGION!;
    if (region === 'us-east-1') {
      return `https://s3.amazonaws.com/${this.bucketName}/${key}`;
    } else {
      return `https://s3.${region}.amazonaws.com/${this.bucketName}/${key}`;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    let key: string;
    
    if (imageUrl.includes(`/${this.bucketName}/`)) {
      const urlParts = imageUrl.split(`/${this.bucketName}/`);
      key = urlParts[1];
    } else if (imageUrl.includes(`${this.bucketName}.s3`)) {
      const urlParts = imageUrl.split('/');
      key = urlParts.slice(3).join('/');
    } else {
      throw new Error('Invalid S3 URL format');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}
