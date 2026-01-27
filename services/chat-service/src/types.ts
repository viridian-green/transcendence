export interface User {
  id: string;
  username: string;
  state?: "online" | "offline" | "busy";
}