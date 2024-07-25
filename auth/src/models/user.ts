import mongoose from 'mongoose';
import { PasswordManager } from '../services/password';

/*
  - Since typescript and mongoose are not good friends we will use this interface 
  to make typescript involved in the user creation process -> it's a trick 😉
*/

interface UserAttrs {
  email: string;
  password: string;
}

/* 
  - An interface that describes the properties of a user model
*/

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// AN interface that describes the properties of user document
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    // timestamps: true,
    toJSON: {
      // this is to transform the json output by in the mongo document
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre('save', async function (done) {
  // check if the password has been modified
  if (this.isModified('password')) {
    const hashedPassword = await PasswordManager.toHash(this.get('password'));
    this.set('password', hashedPassword);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

/* 
  - so to let typescript get involed in the user creation process we will create a new function to
  allow typescript inspection of the inputs before creating the user.
  - This function will return a new user instance  -> This works but its not the best way 

  const buildUser = (attrs: UserAttrs) => {
    return new User(attrs);
  };
*/

export { User };
