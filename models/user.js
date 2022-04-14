import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import mongoosePaginate from 'mongoose-paginate-v2';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    type: {
      type: String,
    },
    contractorInfo: {
      picture: {
        type: String
      },
      intro: {
        type: String
      },
      skills: {
        type: Array,
      },
      attachments: {
        type: Array,
      },
      coordinates: {
        type: Array
      },
      address: {
        country: {
          type: String,
        },
        state: {
          type: String,
        },
        city: {
          type: String,
        },
        street_address: {
          type: String,
        },
        zipcode: {
          type: String,
        }
      },
      ratePerHour: {
        type: Number
      },
    },
    projectInfo: {
      title: {
        type: String
      },
      address: {
        country: {
          type: String,
        },
        state: {
          type: String,
        },
        city: {
          type: String,
        },
        street_address: {
          type: String,
        },
        zipcode: {
          type: String,
        }
      },
      coordinates: {
        type: Array
      },
      description: {
        type: String
      },
      budget: {
        type: Number,
      },
      startDate: {
        type: Date
      }
    }
  }
);

userSchema.plugin(mongoosePaginate);

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);
User.paginate().then({});

export default User;
