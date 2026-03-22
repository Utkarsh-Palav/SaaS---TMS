import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true, // Crucial for queries
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  meetingType: {
    type: String,
    enum: ["In-Person", "Virtual", "Hybrid"],
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    default: null,
  },
  virtualLink: {
    type: String,
    default: null,
  },
  date: {
    type: Date,
    index: true,
  },
  startTime: {
    type: Date,
    required: true,
    index: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Scheduled", "Cancelled", "Completed"],
    default: "Scheduled",
  },
  googleEventId: {
    type: String,
    default: null,
  },
});

MeetingSchema.pre("validate", function (next) {
  if (this.startTime >= this.endTime) {
    next(new Error("End time must be after start time"));
  } else {
    next();
  }
});

const Meeting = mongoose.model("Meeting", MeetingSchema);
export default Meeting;
