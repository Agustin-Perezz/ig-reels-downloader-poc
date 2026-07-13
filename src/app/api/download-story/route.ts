import { storyUrlSchema } from "@/lib/validators";

const NEEDS_AUTH_MESSAGE =
  "Instagram login is required to download stories. Coming soon.";

type StoryBody = {
  url?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  let body: StoryBody;
  try {
    body = (await request.json()) as StoryBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = storyUrlSchema.safeParse(body.url);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid URL" },
      { status: 400 },
    );
  }

  return Response.json(
    { error: NEEDS_AUTH_MESSAGE, needsAuth: true },
    { status: 401 },
  );
}
