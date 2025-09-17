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
    const missingVars = [];
    
    if (!env.AWS_REGION) missingVars.push('AWS_REGION');
    if (!env.AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID');
    if (!env.AWS_SECRET_ACCESS_KEY) missingVars.push('AWS_SECRET_ACCESS_KEY');
    if (!env.AWS_S3_BUCKET_NAME) missingVars.push('AWS_S3_BUCKET_NAME');
    
    if (missingVars.length > 0) {
      throw new Error(
        `AWS configuration is missing. Please set the following environment variables in your .env file: ${missingVars.join(', ')}. ` +
        'You can copy env.example to .env and update the values with your actual AWS credentials.',
      );
    }

    this.s3Client = new S3Client({
      region: env.AWS_REGION!,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: false, // Use virtual-hosted-style URLs
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

    try {
      await this.s3Client.send(command);
      // Use region-specific URL format
      const region = env.AWS_REGION!;
      if (region === 'us-east-1') {
        return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
      } else {
        return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
      }
    } catch (error: unknown) {
      console.error('S3 Upload Error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.name === 'CredentialsProviderError' || error.name === 'NoCredentialsError') {
          throw new Error('AWS credentials are not configured properly. Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
        } else if (error.name === 'NoSuchBucket') {
          throw new Error(`S3 bucket '${this.bucketName}' does not exist. Please check your AWS_S3_BUCKET_NAME environment variable.`);
        } else if (error.name === 'AccessDenied') {
          throw new Error('Access denied to S3 bucket. Please check your AWS credentials and bucket permissions.');
        } else if (error.name === 'InvalidAccessKeyId') {
          throw new Error('Invalid AWS Access Key ID. Please check your AWS_ACCESS_KEY_ID environment variable.');
        } else if (error.name === 'SignatureDoesNotMatch') {
          throw new Error('Invalid AWS Secret Access Key. Please check your AWS_SECRET_ACCESS_KEY environment variable.');
        } else if (error.name === 'InvalidRegion') {
          throw new Error(`Invalid AWS region '${env.AWS_REGION}'. Please check your AWS_REGION environment variable.`);
        } else {
          throw new Error(`Failed to upload image to S3: ${error.message || 'Unknown error'}`);
        }
      }
      
      throw new Error('Failed to upload image to S3: Unknown error');
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const urlParts = imageUrl.split('/');
      const key = urlParts.slice(3).join('/');

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new Error('Failed to delete image from S3');
    }
  }
}
