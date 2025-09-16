import { Schema, model, Document } from 'mongoose';

export interface WorkplacePictureDocument extends Document {
  companyId: string;
  pictureUrl: string;
  caption: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkplacePictureSchema = new Schema<WorkplacePictureDocument>(
  {
    companyId: { type: String, required: true, ref: 'CompanyProfile' },
    pictureUrl: { type: String, required: true },
    caption: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const WorkplacePictureModel = model<WorkplacePictureDocument>(
  'WorkplacePicture',
  WorkplacePictureSchema,
);
