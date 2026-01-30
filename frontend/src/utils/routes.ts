export function isPublicRoute(path: string): boolean {
  const publicRoutes = ['/', '/login', '/register', '/privacy-policy', '/terms-of-service'];
  if (publicRoutes.includes(path)) return true;
  return false;
}
