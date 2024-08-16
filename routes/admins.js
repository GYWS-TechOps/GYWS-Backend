import express from "express";
import  { addMember, editMember, getMember, deleteMember, getAllMembers,getMemberByPosOrYear, importCSVData, } from "../Controller/MembersControllers.js";
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

router.use(ensureAuthenticated);
router.use(ensureAdmin);

router.post("/addMember",upload.single('image'),uploadImage,addMember);
router.post("/addMembers",upload.single('file'),importCSVData)
router.put("/member/:id",upload.single('image'),uploadImage, editMember);
router.delete("/member/:id", deleteMember);


// Routes that require admin permissions

export default router;

