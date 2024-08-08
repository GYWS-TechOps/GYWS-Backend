import express from "express";
import { addMember, editMember, getMember, deleteMember, getAllMembers,getMemberByPosOrYear } from "../Controller/MembersControllers.js";
import { register, login } from "../Controller/AuthControllers.js";
import { ensureAuthenticated, ensureAdmin } from "../Middlewares/Authorization.js";
import {upload, uploadImage} from "../Middlewares/Cloudinary.js"
const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);



router.route("/member").get(getMember);
router.route("/members").get(getAllMembers);
router.route("/memberspy").get(getMemberByPosOrYear);
router.post("/addMember",upload.single('image'),uploadImage, addMember);
router.put("/member/:id",upload.single('image'),uploadImage, editMember);

// Middleware to ensure authentication and admin access for specific routes
router.use(ensureAuthenticated);
router.use(ensureAdmin);

// Routes that require admin permissions
router.delete("/member/:id", deleteMember);

export default router;

