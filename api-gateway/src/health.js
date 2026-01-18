export default async function (app) {
    app.get('/health', {
        logLevel: 'silent'
    }, async () => {
        return { status: "ok"};
    });
}