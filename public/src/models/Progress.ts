import mongoose, { Schema, Document } from "mongoose";

export interface IProgress extends Document {
  userId: string;
  lessonId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: String, required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Progress ||
  mongoose.model<IProgress>("Progress", ProgressSchema);