import mongoose from "mongoose";

const LessonProgressSchema = new mongoose.Schema({
  lessonId:    { type: String, required: true },
  completed:   { type: Boolean, default: false },
  watchTime:   { type: Number, default: 0 }, // seconds watched
  lastWatched: { type: Date, default: Date.now },
  quizScore:   { type: Number, default: -1 }, // -1 = not taken
  bookmarked:  { type: Boolean, default: false },
  notes:       { type: String, default: "" },
});

const ProgressSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId:        { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  lessons:         [LessonProgressSchema],
  lastLessonId:    { type: String, default: "" },
  completedCount:  { type: Number, default: 0 },
  totalLessons:    { type: Number, default: 0 },
  certificateAt:   { type: Date },
  createdAt:       { type: Date, default: Date.now },
  updatedAt:       { type: Date, default: Date.now },
}, { timestamps: true });

ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);
