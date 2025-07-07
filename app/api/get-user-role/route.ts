import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

//   const user = await clerkClient.users.getUser(userId);
 const client = await clerkClient()

  
  const user = await client.users.getUser(userId)

  const role = user?.unsafeMetadata?.role || null;

  return Response.json({ role });
}