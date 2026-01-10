/**
 * Health check route
 * Provides a simple health check endpoint
 */
export default async function healthRoute(app) {
    app.get('/health', async () => {
        return { status: "ok"};
    });
}

