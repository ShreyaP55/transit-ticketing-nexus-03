
import mongoose from "mongoose";

const PassUsageSchema = new mongoose.Schema({
  userId: { type: String, required: true },  // Clerk User ID
  passId: { type: mongoose.Schema.Types.ObjectId, ref: "Pass", required: true },
  scannedAt: { type: Date, default: Date.now },
  location: { type: String }, // Optional: Store bus stop/location
  verifiedBy: { type: String }, // Admin who verified the usage
  busId: { type: String }, // Bus where the pass was used
  stationName: { type: String }, // Station name
  isVerified: { type: Boolean, default: false },
  verificationDate: { type: Date }
});

// Index for efficient queries
PassUsageSchema.index({ userId: 1, scannedAt: -1 });
PassUsageSchema.index({ passId: 1 });

// Check if the model exists before creating a new one
const PassUsage = mongoose.models.PassUsage || mongoose.model("PassUsage", PassUsageSchema);

export default PassUsage;
