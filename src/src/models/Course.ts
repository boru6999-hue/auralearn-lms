import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  instructorId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  isPublished: boolean;
  category?: string;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    price: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    category: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);