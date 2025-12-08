import { eventType } from "./eventType";
import { defineType } from "sanity";
import { projectType } from "./projectType";
export const schema = {
  types: [eventType, projectType],
};
