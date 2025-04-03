import { Router } from "express";
import {
  getExercises,
  getExerciseById,
  favoriteExercise,
  createExercise,
  modifyExercise,
  deleteExercise,
} from "../controllers/exerciseController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, createExercise); // Create a new exercise
router.put("/:id", authenticateToken, modifyExercise); // Modify an existing exercise
router.delete("/:id", authenticateToken, deleteExercise); // Delete exercise
router.get("/", authenticateToken, getExercises); //Fetch all public exercises
router.get("/:id", authenticateToken, getExerciseById); // Fetch a specific exercise by ID
router.post("/:id/favorite", favoriteExercise); //Toggle favorite status

export default router;
