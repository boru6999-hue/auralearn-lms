import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, default: "" },
  role:         { type: String, enum: ["student", "premium", "admin"], default: "student" },
  status:       { type: String, enum: ["active", "banned"], default: "active" },
  image: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  createdAt:    { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);

