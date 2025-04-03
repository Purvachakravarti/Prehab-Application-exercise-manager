import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";

class Exercise extends Model {
  public id!: number;
  public name!: string;
  public description?: string;
  public difficulty?: string;
  public isPublic!: boolean;
  public createdBy!: number;
}

Exercise.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    difficulty: { type: DataTypes.STRING },
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: "Exercise" }
);

export default Exercise;
