import User from "@/models/User";
import Gig from "@/models/Gig";
import Application from "@/models/Application";
import connectToDBS from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { auth, clerkClient } from '@clerk/nextjs/server';
console.log()
export async function GET(req: NextRequest) {
  try {
    await connectToDBS();

    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkId = req.nextUrl.searchParams.get('clerkId');
    const userToFind = clerkId || authUserId;
          console.log('error here',userToFind)
 

    const user = await clerkClient().then(client => client.users.getUser(userToFind));
          // console.log('error',user)


    const data = await User.findOne({ clerkId: userToFind }).populate({
      path: 'applications',
      populate: {
        path: 'gig',
        model: 'Gig',
      },
    });
          // console.log('error in',data)


    if (!data) {
      // console.log('error in data')
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: user?.emailAddresses?.[0]?.emailAddress || "",
      bio: data.bio || "",
      skills: data.skills || [],
      portfoliosite: data.portfoliosite || "",
      appliedGigs: data.applications.map((app: any) => ({
        applicationId: app._id,
        gigId: app.gig?._id,
        gigTitle: app.gig?.title || "Untitled",
        status: app.status,
        appliedAt: app.createdAt,
      })),
    });

  } catch (error) {
    console.error("GET /api/get-user ERROR", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDBS();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, bio, skills, portfoliosite } = body;

    const updatePayload: any = {};

    if (applicationId) {
      const application = await Application.findById(applicationId);
      if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }

      const gigId = application.gig;
      const freelancerId = application.freelancer;

      // Delete application
      await Application.findByIdAndDelete(applicationId);

      // Remove from User.applications
      await User.findOneAndUpdate(
        { clerkId: userId },
        { $pull: { applications: application._id } }
      );

      // Remove from Gig.applicants
      await Gig.findByIdAndUpdate(
        gigId,
        { $pull: { applicants: freelancerId } }
      );
    }

    if (bio) updatePayload.bio = bio;
    if (skills) updatePayload.skills = skills;
    if (portfoliosite) updatePayload.portfoliosite = portfoliosite;

    if (Object.keys(updatePayload).length > 0) {
      await User.findOneAndUpdate(
        { clerkId: userId },
        { $set: updatePayload }
      );
    }

    return NextResponse.json({
      message: `Update successful${applicationId ? ' & application withdrawn' : ''}`
      // user:updatedUser
    });

  } catch (error) {
    console.error("PUT /api/get-user ERROR", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
