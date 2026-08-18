import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as uploadController from "../controllers/uploadController";

const router = Router();

router.post("/image", authenticate, uploadController.uploadImage);

export default router;
