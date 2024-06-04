import { Schema, model } from 'mongoose';

const contactSchema = new Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    email: { type: String, default: '' },
    isFavourite: { type: Boolean, default: false },
    contactType: {
      type: String,
      required: false,
      enum: ['work', 'home', 'personal'],
      default: 'personal',
    },
  },
  { timestamps: true, versionKey: false },
);

export const Contact = model('contacts', contactSchema);
