const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const holdingSchema = new mongoose.Schema(
  {
    ticker:   { type: String, required: true },
    shares:   { type: Number, required: true, default: 0 },
    avgCost:  { type: Number, required: true, default: 0 }, // average cost per share
  },
  { _id: false }
);

const tradeSchema = new mongoose.Schema(
  {
    ticker:    { type: String, required: true },
    type:      { type: String, enum: ['buy', 'sell'], required: true },
    shares:    { type: Number, required: true },
    price:     { type: Number, required: true },
    total:     { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // Virtual cash balance (starts at $10,000)
    balance: {
      type: Number,
      default: 10000,
    },
    // Stocks being watched (live feed)
    subscriptions: {
      type: [String],
      default: [],
    },
    // Current holdings
    portfolio: {
      type: [holdingSchema],
      default: [],
    },
    // Full trade history
    trades: {
      type: [tradeSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
