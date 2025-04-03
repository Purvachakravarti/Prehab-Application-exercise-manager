import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";

class UserInteraction extends Model {
  public id!: number;
  public userId!: number;
  public exerciseId!: number;
  public isFavorited!: boolean;
  public isSaved!: boolean;
  public rating?: number;
}

UserInteraction.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    exerciseId: { type: DataTypes.INTEGER, allowNull: false },
    isFavorited: { type: DataTypes.BOOLEAN, defaultValue: false },
    isSaved: { type: DataTypes.BOOLEAN, defaultValue: false },
    rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  },
  {
    sequelize,
    modelName: "UserInteraction",
  }
);

export default UserInteraction;
