import express from "express";
import { protectedRoute } from "../middlewares/authorization.js";
import { createQuranRecord, createSubciRecord, getRecordsByHalaqa, deleteRecord, getQuranRecordsByClassAndMonth } from "../controllers/lessonRecordController.js";

const router = express.Router();

// Qur'aan (class-based)
router.post("/quran", protectedRoute, createQuranRecord);
router.get("/quran/class/:classId", protectedRoute, getQuranRecordsByClassAndMonth);

// Subci (halaqa-based)
router.post("/subci", protectedRoute, createSubciRecord);
router.get("/halaqa/:halaqaId", protectedRoute, getRecordsByHalaqa);

router.delete("/delete/:id", protectedRoute, deleteRecord);

export default router;