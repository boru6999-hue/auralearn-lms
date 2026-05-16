import mongoose, { Schema, Document } from "mongoose";

export interface ILesson extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  videoUrl: string;
  videoType: "youtube" | "upload";
  order: number;
  isFree: boolean;
  duration?: number;
}

const LessonSchema = new Schema<ILesson>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    videoType: { type: String, enum: ["youtube", "upload"], default: "youtube" },
    order: { type: Number, required: true },
    isFree: { type: Boolean, default: false },
    duration: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.models.Lesson ||
  mongoose.model<ILesson>("Lesson", LessonSchema);