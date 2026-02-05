import jwt from "jsonwebtoken";
import fs from "fs";
import { User } from "../types.js";

function resolveJwtSecret(): string | undefined {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  const jwtSecretFile = process.env.JWT_SECRET_FILE;
  if (jwtSecretFile) {
    try {
      return fs.readFileSync(jwtSecretFile, "utf8").trim();
    } catch (err) {
      console.error(
        `Failed to read JWT secret file at ${jwtSecretFile}:`,
        err
      );
      return undefined;
    }
  }

  return undefined;
}

const jwtSecret = resolveJwtSecret();

// Extract user info from JWT in cookies
function extractUserFromJWT(request: any): User | null {
  const cookieHeader = request.headers["cookie"] as string | undefined;
  let cookies: Record<string, string> = {};
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length === 2) {
        cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
      }
    });
  }
  const accessToken = cookies["access_token"];
  if (accessToken && jwtSecret) {
    try {
      const decoded = jwt.verify(accessToken, jwtSecret) as any;
      if (decoded.username && decoded.id) {
        return { username: decoded.username, id: String(decoded.id) };
      }
    } catch (err) {
      console.error("Invalid JWT:", err);
      return null;
    }
  }
  return null;
}

export default extractUserFromJWT;
