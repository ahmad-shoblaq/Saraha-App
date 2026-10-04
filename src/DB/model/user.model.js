import {model, Schema} from "mongoose";
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: function () {
            if (this.phone) {
                return false;
            }
            return true;
        },
        trim: true,
        lowercase: true,
       // unique: true
    },
    password: {
        type: String,
        required: function () {
            if (this.userAgent === "google") {
                return false;
            }
            return true;
        }
    },
    phone: {
        type: String,
        required: function () {
            if (this.email) {
                return false;
            }
            return true;
        },
      //  unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    dob: {
        type: Date,
        required: function () {
            if (this.userAgent === "google") {
                return false;
            }
            return true;
        }
    },
    otp: {
        type: Number
    },
    otpExpire: {
        type: Date
    },
    userAgent: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    // Cloud
    profilePicture: {
        secure_url: String,
        public_id: String
    },
    credentialsUpdatedAt: {
        type: Date,
        default: Date.now()
    },
    deletedAt: {
        type: Date
    },
    
},{
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("fullName").set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
});

userSchema.virtual("age").get(function () {
    return new Date().getFullYear() - new Date(this.dob).getFullYear();
});

userSchema.virtual("messages", {
    ref: "Message",
    localField: "_id",
    foreignField: "receiver"
});
export const User = model("User", userSchema);