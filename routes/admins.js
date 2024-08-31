import express from "express";
import  { addMember, editMember, getMember, deleteMember, getAllMembers,getMemberByPosOrYear, importCSVData, addMemberData, searchMember} from "../Controller/AdminPanel/MembersControllers.js";
import { register, login } from "../Controller/AdminPanel/AuthControllers.js"
import { ensureAuthenticated, ensureAdmin } from "../Middlewares/AdminPanel/Authorization.js";
import {upload, uploadImage} from "../Middlewares/AdminPanel/Cloudinary.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);


router.route("/member").get(getMember);
router.route("/members").get(getAllMembers);
router.route("/memberspy").get(getMemberByPosOrYear);
router.route("/memberSearch/:searchString").get(searchMember);

router.put("/addMemberData/:_id",upload.single('image'),uploadImage,addMemberData);
router.put("/member/:_id",upload.single('image'),uploadImage, editMember);
router.post("/addMember",upload.single('image'),uploadImage,addMember);
router.delete("/member/:_id", deleteMember);
router.post("/addMembers",upload.single('file'),importCSVData)

router.use(ensureAuthenticated);
router.use(ensureAdmin);

// Routes that require admin permissions

export default router;

