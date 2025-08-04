import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const chatSchema = new Schema({
  participants: [
    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ],
  messages: [messageSchema],
});

const Chat = model('Chat', chatSchema);

export { Chat };
