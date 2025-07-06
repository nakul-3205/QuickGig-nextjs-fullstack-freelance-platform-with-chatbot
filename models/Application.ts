import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IApplication extends Document {
  gig: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  coverLetter?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const ApplicationSchema = new Schema<IApplication>(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'rejected'],
    },
  },
  { timestamps: true }
);

const Application = models.Application || model<IApplication>('Application', ApplicationSchema);
export default Application;
