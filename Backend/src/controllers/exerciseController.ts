import { Request, Response } from "express";
import Exercise from "../models/Exercise";
import UserInteraction from "../models/UserInteraction";
import { Op, Order } from "sequelize";

interface CustomRequest extends Request {
  user?: {
    userId: number;
  };
}

export const createExercise = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { name, description, difficulty, isPublic } = req.body;
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  try {
    const newExercise = await Exercise.create({
      name,
      description,
      difficulty,
      isPublic,
      createdBy: userId,
    });
    res.status(201).json(newExercise);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const modifyExercise = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, description, difficulty, isPublic } = req.body;
  const userId = req.user?.userId;

  try {
    const exercise = await Exercise.findByPk(id);

    if (!exercise) {
      res.status(404).json({ error: "Exercise not found" });
      return;
    }

    // For public exercises
    if (isPublic) {
      // Public exercises can only allow description and difficulty modifications
      if (description) {
        exercise.description = description;
      }
      if (difficulty) {
        exercise.difficulty = difficulty;
      }

      await exercise.save();
      res.status(200).json(exercise);
      return;
    }

    // For non-public exercises
    if (!isPublic && exercise.createdBy !== userId) {
      res
        .status(403)
        .json({ error: "You are not authorized to modify this exercise" });
      return;
    }

    // Full modification for non-public exercises by the creator
    if (name) {
      exercise.name = name;
    }
    if (description) {
      exercise.description = description;
    }
    if (difficulty) {
      exercise.difficulty = difficulty;
    }

    await exercise.save();
    res.status(200).json(exercise);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

//Retrieve All Public and User-Specific Exercises

export const getExercises = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId; // Get user ID from middleware
  const filter = req.query.filter as string; // Cast query parameters
  const sort = req.query.sort as string; // Sort query parameter

  try {
    // Construct search conditions for public exercises
    const publicCondition = {
      isPublic: true,
      ...(filter && {
        [Op.or]: [
          { name: { [Op.iLike]: `%${filter}%` } },
          { description: { [Op.iLike]: `%${filter}%` } },
          { difficulty: { [Op.iLike]: `%${filter}%` } },
        ],
      }),
    };

    // Construct search conditions for non-public exercises created by the user
    const userCondition = userId
      ? {
          createdBy: userId,
          isPublic: false,
          ...(filter && {
            [Op.or]: [
              { name: { [Op.iLike]: `%${filter}%` } },
              { description: { [Op.iLike]: `%${filter}%` } },
              { difficulty: { [Op.iLike]: `%${filter}%` } },
            ],
          }),
        }
      : {};

    // Combine public and user conditions
    const whereClause = {
      [Op.or]: [publicCondition, userCondition],
    };

    // Validate sort parameter and structure the order
    const validSortOptions = ["difficulty", "name", "createdAt"];
    const order =
      sort && validSortOptions.includes(sort)
        ? ([[sort, "ASC"]] as Order) // Explicit cast to Sequelize's `Order` type
        : undefined;

    // Fetch the exercises with filtering, sorting, and conditions
    const exercises = await Exercise.findAll({
      where: whereClause,
      order: order,
    });

    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
//Retrieve a specific exercise
export const getExerciseById = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const exercise = await Exercise.findByPk(id);
    if (!exercise) {
      res.status(404).json({ error: "Exercise not found" });
      return;
    }

    if (!exercise.isPublic && exercise.createdBy !== userId) {
      res
        .status(403)
        .json({ error: "You are not authorized to view this exercise" });
      return;
    }

    res.status(200).json(exercise);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const deleteExercise = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const exercise = await Exercise.findByPk(id);

    if (!exercise) {
      res.status(404).json({ error: "Exercise not found" });
      return;
    }

    // Public exercises can only be deleted
    if (exercise.isPublic) {
      res.status(403).json({
        error: "You are not authorized to delete this public exercise",
      });
      return;
    }

    // Non-public exercises can only be deleted by the creator
    if (!exercise.isPublic && exercise.createdBy !== userId) {
      res
        .status(403)
        .json({ error: "You are not authorized to delete this exercise" });
      return;
    }

    await exercise.destroy();
    res.status(200).json({ message: "Exercise deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

// =====================================BONUS POINT =================================================================

// export const favoriteExercise = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const userId = req.user?.userId;

//   try {
//     const favorite = await UserFavorites.findOne({
//       where: { userId, exerciseId: id },
//     });
//     if (favorite) {
//       await favorite.destroy();
//       await Exercise.decrement("favoritesCount", { where: { id } });
//       res.status(200).json({ message: "Exercise unfavorited" });
//     } else {
//       await UserFavorites.create({ userId, exerciseId: id });
//       await Exercise.increment("favoritesCount", { where: { id } });
//       res.status(200).json({ message: "Exercise favorited" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const saveExercise = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const userId = req.user?.userId;

//   try {
//     const save = await UserSaves.findOne({ where: { userId, exerciseId: id } });
//     if (save) {
//       await save.destroy();
//       await Exercise.decrement("savesCount", { where: { id } });
//       res.status(200).json({ message: "Exercise unsaved" });
//     } else {
//       await UserSaves.create({ userId, exerciseId: id });
//       await Exercise.increment("savesCount", { where: { id } });
//       res.status(200).json({ message: "Exercise saved" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// export const rateExercise = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { rating } = req.body;
//   const userId = req.user?.userId;

//   try {
//     const userRating = await UserRatings.findOne({
//       where: { userId, exerciseId: id },
//     });
//     if (userRating) {
//       userRating.rating = rating;
//       await userRating.save();
//     } else {
//       await UserRatings.create({ userId, exerciseId: id, rating });
//     }

//     res.status(200).json({ message: "Rating submitted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getFavoritesAndSaves = async (req: Request, res: Response) => {
//   const userId = req.user?.userId;

//   try {
//     const favorites = await UserFavorites.findAll({ where: { userId } });
//     const saves = await UserSaves.findAll({ where: { userId } });

//     const combinedExercises = [...favorites, ...saves].map((record) => ({
//       ...record,
//       isFavorited: !!favorites.find(
//         (fav) => fav.exerciseId === record.exerciseId
//       ),
//       isSaved: !!saves.find((save) => save.exerciseId === record.exerciseId),
//     }));

//     res.status(200).json(combinedExercises);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// export const getPublicExercises = async (req: Request, res: Response) => {
//   const sort = req.query.sort as string; // Sorting by difficulty
//   const order = sort === "difficulty" ? [[sort, "ASC"]] : undefined;

//   try {
//     const exercises = await Exercise.findAll({
//       where: { isPublic: true },
//       order,
//     });

//     res.status(200).json(exercises);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getSpecificExercise = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const userId = req.user?.userId;

//   try {
//     const exercise = await Exercise.findByPk(id);

//     if (!exercise) {
//       return res.status(404).json({ error: "Exercise not found" });
//     }

//     if (!exercise.isPublic && exercise.createdBy !== userId) {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     const favoritesCount = await UserFavorites.count({
//       where: { exerciseId: id },
//     });
//     const savesCount = await UserSaves.count({ where: { exerciseId: id } });

//     res.status(200).json({
//       ...exercise.toJSON(),
//       favoritesCount,
//       savesCount,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
