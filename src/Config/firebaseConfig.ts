import admin from "firebase-admin";

var serviceAccount = require("../../notification-70724-firebase-adminsdk-iykso-cc3cbb534f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const fcm = admin.messaging();
