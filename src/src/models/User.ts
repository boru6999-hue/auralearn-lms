import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, default: "" },
  role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
  image: { type: String, default: "" },
  coverImage: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
