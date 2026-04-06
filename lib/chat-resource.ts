export function getChatResourceId(userId: string | null | undefined) {
  return userId ?? "anonymous";
}

