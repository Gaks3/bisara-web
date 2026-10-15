import { LearningCatalogData } from "@/lib/api-service";

export type LevelStatus = "locked" | "active" | "done";

export type Level = LearningCatalogData["levels"][number];

export interface LevelStateItem {
  level: Level;
  state: LevelStatus;
  totalChapters: number;
  completedChapters: number;
  percent: number;
}
