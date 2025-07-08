import User from "@/models/User";
import Gig from "@/models/Gig";
import Application from "@/models/Application";
import connectToDBS from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    await connectToDBS();

    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkId = req.nextUrl.searchParams.get('clerkId');
    const userToFind = clerkId || authUserId;

    const user = await clerkClient().then(client => client.users.getUser(userToFind));
    const data = await User.findOne({ clerkId: userToFind })
      .populate({
        path: 'applications',
        populate: {
          path: 'gig',
          model: 'Gig',
        },
      })
      .populate({
        path: 'gigsPosted',
        model: 'Gig',
      });

    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: user?.emailAddresses?.[0]?.emailAddress || "",
      role: data.role,
      bio: data.bio || "",
      portfoliosite: data.portfoliosite || "",
      skills: data.skills || [],
      appliedGigs: data.applications?.map((app: any) => ({
        applicationId: app._id,
        gigId: app.gig?._id,
        gigTitle: app.gig?.title || "Untitled",
        status: app.status,
        appliedAt: app.createdAt,
      })) || [],
      gigsPosted: data.gigsPosted?.map((gig: any) => ({
        _id: gig._id,
        title: gig.title,
        status: gig.status,
        budget: gig.budget,
        deadline: gig.deadline,
      })) || [],
    });

  } catch (error) {
    console.error("GET /api/get-user ERROR", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
