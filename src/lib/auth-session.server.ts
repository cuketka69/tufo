import { useSession } from "@tanstack/react-start/server";

import { getSessionPassword } from "@/lib/password.server";

type SessionData = { userId?: number };

function session() {
  return useSession<SessionData>({ password: getSessionPassword() });
}

export async function setUserSession(userId: number) {
  const s = await session();
  await s.update({ userId });
}

export async function getSessionUserId(): Promise<number | null> {
  const s = await session();
  return s.data.userId ?? null;
}

export async function clearUserSession() {
  const s = await session();
  await s.clear();
}
