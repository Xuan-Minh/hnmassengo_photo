/**
 * Ce fichier de configuration vous permet d'exécuter `$ sanity [command]` dans ce dossier
 * Allez sur https://www.sanity.io/docs/cli pour en savoir plus.
 **/
import { defineCliConfig } from "sanity/cli";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

export default defineCliConfig({ api: { projectId, dataset } });
