import jwt from "jsonwebtoken";

// Extract user info from JWT in cookies
export function extractUserFromJWT(request) {
  const cookieHeader = request.headers["cookie"];
  let cookies = {};
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length === 2) {
        cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
      }
    });
  }

  const accessToken = cookies["access_token"];
  const jwtSecret = process.env.JWT_SECRET;

  if (accessToken && jwtSecret) {
    try {
      const decoded = jwt.verify(accessToken, jwtSecret);
      if (decoded.username && decoded.id) {
        return { username: decoded.username, id: String(decoded.id), state: "offline" };
      }
    } catch (err) {
      console.error("Invalid JWT:", err);
      return null;
    }
  }
  return null;
}
