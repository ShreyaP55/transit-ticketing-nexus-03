
import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
    selectedStation: { type: String, required: true }, // Station where user will board
    price: { type: Number, required: true },
    paymentIntentId: { type: String, required: true },
    purchasedAt: { type: Date, default: Date.now },
    expiresAt: { 
      type: Date, 
      default: function() {
        return new Date(Date.now() + 7 * 60 * 60 * 1000); // 7 hours from now
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Virtual field to check if ticket is expired
TicketSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Ensure virtuals are included in JSON output
TicketSchema.set('toJSON', { virtuals: true });

// Check if the model exists before creating a new one
const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
export default Ticket;
