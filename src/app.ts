import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "../swagger-output.json";
import {
  addGroup,
  dothis,
  getAllChatUsers,
  getAllMessages,
  getChatDetails,
  testLogin,
} from "./Controllers/testCont";
import { verifyToken } from "./Middlewares/authMiddlewares";
import multer from "multer";
import cors from "cors";

import authRoutes from "./Routes/authRoutes";
import hoardinRoutes from "./Routes/hoardingRoutes";
import bookingRoutes from "./Routes/bookingRoutes";
import userRoutes from "./Routes/userRoutes";
import planRoutes from "./Routes/planRoutes";
import ticketRoutes from "./Routes/ticketRoutes";
import dashboardRoutes from "./Routes/dashboardRoutes";
import sidebarRoutes from "./Routes/sidebarRoutes";
import termsAndConditonRoutes from "./Routes/termsRoutes";
import notificationRoutes from "./Routes/notificationRoutes";
import ratingsRoutes from "./Routes/reviewRoutes";
import privacyPolicyRouts from "./Routes/privacyPolicyRoutes";
import languageRoutes from "./Routes/languageRoutes";
import helpRotes from "./Routes/helpRoutes";
import faqRoutes from "./Routes/faqRoutes";
import countryCodeRoutes from "./Routes/countryCodeRoutes";
import categoryRoutes from "./Routes/categoryRoutes";
import favoriteRoutes from "./Routes/favoritesRoutes";
import featureRoutes from "./Routes/featureRoutes";
import notificationTypeRoutes from "./Routes/notificationTypeRoutes";

const upload = multer();

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/hoarding", verifyToken, hoardinRoutes);
app.use("/api/user", verifyToken, userRoutes);
app.use("/api/plans", verifyToken, planRoutes);
app.use("/api/ticket", verifyToken, ticketRoutes);
app.use("/api/booking", verifyToken, bookingRoutes);
app.use("/api/dashboard", verifyToken, dashboardRoutes);
app.use("/api/sidebar", verifyToken, sidebarRoutes);
app.use("/api/termsandconditions", termsAndConditonRoutes);
app.use("/api/notifications", verifyToken, notificationRoutes);
app.use("/api/ratingsandreviews", verifyToken, ratingsRoutes);
app.use("/api/privacyPolicy", verifyToken, privacyPolicyRouts);
app.use("/api/language", verifyToken, languageRoutes);
app.use("/help", verifyToken, helpRotes);
app.use("/api/faqs", verifyToken, faqRoutes);
app.use("/api/countryCodes", verifyToken, countryCodeRoutes);
app.use("/api/category", verifyToken, categoryRoutes);
app.use("/api/favorites", verifyToken, favoriteRoutes);
app.use("/api/hoardingFeature", verifyToken, featureRoutes);
app.use("/api/notificationTypes", verifyToken, notificationTypeRoutes);
app.use("/test/login", testLogin);
app.get("/test/getChatUsers", getAllChatUsers);
app.get("/test/getAllMessages/:userid", getAllMessages);
app.get("/test/group", addGroup);

//called when the reciever got a new message if he is online
// if he is offline get the
// store new messages
// sender : id , reciver : id
app.get("/chatDetails", getChatDetails);
app.get("/test", dothis);
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use("*", (req, res) => {
  return res.status(404).json({ message: "source not found" });
});

export default app;
