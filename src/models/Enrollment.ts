import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  userId: string;
  courseId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  paymentId?: string;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    paymentId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);