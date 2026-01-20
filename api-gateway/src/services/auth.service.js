/**
 * Authentication service for API Gateway
 * Handles JWT verification and route protection
 */

const PUBLIC_ROUTES = [
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/signout",
    "/health",
    "/game",
    "/game-start",
];

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(pathname) {
    return PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + "/")
    );
}

/**
 * Authentication hook - verifies JWT tokens for protected routes
 */
export async function authHook(request, reply) {
    if (request.method === 'OPTIONS') {
        return;
    }

    const url = request.raw.url;
    const pathname = url.split('?')[0]; // Remove query string

    // Skip authentication for public routes
    if (isPublicRoute(pathname)) {
        return;
    }

    if (pathname.startsWith('/game/')) {
    return;
    }

    try {
        // Verify JWT token from cookie - this automatically attaches payload to request.user
        await request.jwtVerify();
        if (request.user) {
            ["id", "username", "email"].forEach((key) =>
                reply.header(`x-user-${key}`, request.user[key])
            );
        }

        // Check for 2FA pending status
        if (
            request.user.type === "2fa_pending" &&
            !pathname.startsWith("/api/auth/2fa")
        ) {
            reply.code(403).send({ message: "2FA required" });
            return;
        }

        // User info is already in request.user (set by jwtVerify)
        // The proxy will read it and forward via headers
    } catch (err) {
        reply.code(401).send({ message: "Invalid or missing authentication token" });
        return;
    }
}

