import { eventType } from "./eventType";
import { defineType } from "sanity";
import { projectType } from "./projectType";
import shopItem from "./shopItem";

export const schema = {
  types: [eventType, projectType, shopItem],
};
