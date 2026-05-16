import mongoose from "mongoose";

const QuizQuestionSchema = new mongoose.Schema({
  question:    { type: String, required: true },
  options:     [{ type: String }],
  correct:     { type: Number, required: true },
  explanation: { type: String, default: "" },
});

const LessonSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  type:        { type: String, enum: ["video","pdf","quiz","file"], default: "video" },
  duration:    { type: Number, default: 0 },
  videoUrl:    { type: String, default: "" },
  pdfUrl:      { type: String, default: "" },
  fileUrl:     { type: String, default: "" },
  fileName:    { type: String, default: "" },
  description: { type: String, default: "" },
  quiz:        [QuizQuestionSchema],
  isFree:      { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
});

const SectionSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  order:   { type: Number, default: 0 },
  lessons: [LessonSchema],
});

const CourseSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  slug:          { type: String },
  description:   { type: String, default: "" },
  category:      { type: String, default: "development" },
  thumbnail:     { type: String, default: "" },
  status:        { type: String, enum: ["draft","published"], default: "draft" },
  featured:      { type: Boolean, default: false },
  price:         { type: Number, default: 0 },
  sections:      [SectionSchema],
  studentsCount: { type: Number, default: 0 },
  rating:        { type: Number, default: 0 },
  instructor:    { type: String, default: "AuraLearn" },
  language:      { type: String, default: "mn" },
  level:         { type: String, enum: ["beginner","intermediate","advanced"], default: "beginner" },
}, { timestamps: true });

// Remove pre-save middleware - slug generated in API instead
export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
