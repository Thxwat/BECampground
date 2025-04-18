const mongoose = require("mongoose");

const CampgroundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },

    address: {
      type: String,
      required: [true, "Please add a region"],
    },

    tel: {
      type: String,
      required: [true, "Please add a telephone number"],
    },

    picture: {
      type: String,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, id: false }
);

// Cascade delete appointments when a campground is deleted
CampgroundSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Appointments being removed from campground ${this._id}`);
    await this.model("Appointment").deleteMany({ campground: this._id });
    next();
  }
);

// Reverse populate with virtuals
CampgroundSchema.virtual("appointments", {
  ref: "Appointment",
  localField: "_id",
  foreignField: "campground",
  justOne: false,
});
module.exports = mongoose.model("Campground", CampgroundSchema);
