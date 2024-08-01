import express from "express";
import { addMember, editMember, getMember, deleteMember, getAllMembers,getMemberByPosOrYear } from "../Controller/MembersControllers.js";
import { register, login } from "../Controller/AuthControllers.js";
import { ensureAuthenticated, ensureAdmin } from "../Middlewares/Authorization.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);



router.route("/member").get(getMember);
router.route("/members").get(getAllMembers);
router.route("/memberspy").get(getMemberByPosOrYear);

// Middleware to ensure authentication and admin access for specific routes
router.use(ensureAuthenticated);
router.use(ensureAdmin);

// Routes that require admin permissions
router.post("/addMember", addMember);
router.put("/member/:id", editMember);
router.delete("/member/:id", deleteMember);

export default router;

