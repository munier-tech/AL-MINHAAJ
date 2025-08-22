import express from "express";
import { protectedRoute } from "../middlewares/authorization.js";
import { createQuranRecord, createSubciRecord, getRecordsByHalaqa, deleteRecord } from "../controllers/lessonRecordController.js";

const router = express.Router();

router.post("/quran", protectedRoute, createQuranRecord);
router.post("/subci", protectedRoute, createSubciRecord);
router.get("/halaqa/:halaqaId", protectedRoute, getRecordsByHalaqa);
router.delete("/delete/:id", protectedRoute, deleteRecord);

export default router;