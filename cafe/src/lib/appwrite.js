
import {
  Account,
  Client,
  Databases,
  Storage,
  TablesDB,
} from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error(
    "Appwrite configuration is missing. Check your .env file."
  );
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);
jkhk

export const databases = new Databases(client);
export const storage = new Storage(client);
export const tablesDB = new TablesDB(client);

export default client;
