import { db } from "../connection.js";

export const User = db.collection('users');
// User.createIndex({ email: 1 }, { unique: true });