import avatarRoutes  from "./avatar.routes.js";
import userStateRoute from "./state.routes.js";
export default async function userRoutes(app) {
  await avatarRoutes(app);
  await userStateRoute(app);
}