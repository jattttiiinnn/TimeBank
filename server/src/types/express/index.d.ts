import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface User extends Document {
      _id: string;
      email: string;
      // Add other user properties as needed
    }

    interface Request {
      user?: User;
    }
  }
}
