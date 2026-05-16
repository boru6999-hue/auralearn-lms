import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  courseId:  { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  lessonId:  { type: String, default: "" },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName:  { type: String, default: "" },
  userImage: { type: String, default: "" },
  content:   { type: String, required: true },
  likes:     { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
