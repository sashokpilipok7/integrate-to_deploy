import mongoose from "mongoose";

const dbURI = "mongodb://localhost:27017/lc_cloud";

mongoose.connect(dbURI);

export const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  defaultId: String,
  // aws_key: String,
  // aws_secret: String,
  // aws_zone: String,
  // get all the sites associated with the user
  sites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
    },
  ],
});

export const User = mongoose.model("User", userSchema);

const connectionSchema = new mongoose.Schema({
  name: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  params: Object,
});

export const Connection = mongoose.model("Connection", connectionSchema);

const siteSchema = new mongoose.Schema({
  name: String,
  url: Array,
  siteId: String,
  userId: String,
  username: String,
  status: String, // 'deployed' | 'deploying' | 'not-deployed' | 'error'
  // use the type ConnectionInfo
  connectionInfo: {
    type: Object,
  },
  connectionVerified: Boolean,
  createdAt: Date,
  updatedAt: Date,

  // bucketName: {
  //   type: String,
  //   unique: true
  // },
  // connection: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Connection'
  // },
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User'
  // }
});

export const Site = mongoose.model("Site", siteSchema);
