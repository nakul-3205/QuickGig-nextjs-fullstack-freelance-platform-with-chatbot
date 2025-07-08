import { NextRequest, NextResponse } from "next/server";
import connectToDBS from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Gig from "@/models/Gig";
import User from "@/models/User";
import Application from "@/models/Application";

export async function  POST(req:NextRequest) {
    try {
        await connectToDBS()
         const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
      const  { title, description, category, budget, deadline, tags }= await req.json()
       const client = await User.findOne({ clerkId: userId });
    if (!client || client.role !== "client") {
      return NextResponse.json({ error: "Only clients can post gigs." }, { status: 403 });
    }
     const newGig = await Gig.create({
      title,
      description,
      category,
      budget,
      deadline,
      status: "open",
      postedBy: client._id,
      applicants: [],
      tags: tags || []
    });
    client.gigsPosted.push(newGig._id);
    await client.save();

    return NextResponse.json({ message: "Gig posted successfully", gig: newGig });
    } catch (error) {
        console.error("POST /api/client-gig error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    
}

export async function GET(req: NextRequest) {
  try {
    await connectToDBS();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await User.findOne({ clerkId: userId });
    if (!client || client.role !== "client") {
      return NextResponse.json({ error: "Only clients can access this." }, { status: 403 });
    }

    const gigsRaw = await Gig.find({ postedBy: client._id }).sort({ createdAt: -1 }).lean();

    const gigs = await Promise.all(
      gigsRaw.map(async (gig) => {
        const applications = await Application.find({ gig: gig._id })
          .populate({
            path: 'freelancer',
            model: 'User',
            select: 'email skills portfoliosite bio avatar',
          })
          .lean();
            
        const applicants = applications.map(app => ({
          _id: app.freelancer._id,
          email: app.freelancer.email,
          skills: app.freelancer.skills,
          portfoliosite: app.freelancer.portfoliosite,
          bio: app.freelancer.bio,
          avatar: app.freelancer.avatar,
          status: app.status,
        }));
        return {
          ...gig,
          applicants,
        };
      })
    );
            // console.log(gigs)

    return NextResponse.json({ gigs });
  } catch (error) {
    console.error("GET /api/client-gig error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function  PUT(req:NextRequest) {
    try {
         await connectToDBS()
         const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
       const client = await User.findOne({ clerkId: userId });
        const { gigId, freelancerId, action } = await req.json();
          const gig = await Gig.findOne({ _id: gigId, postedBy: client._id });
    if (!gig) {
      return NextResponse.json({ error: "Gig not found or unauthorized." }, { status: 404 });
    }
 const application = await Application.findOne({ gig: gigId, freelancer: freelancerId });
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    };
     application.status = action === "accept" ? "accepted" : "rejected";
    await application.save();

    return NextResponse.json({ message: `Application ${action}ed successfully.` });
    } catch (error) {
        console.error("PUT /api/client-gig error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest) {
  try {
    await connectToDBS();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gigId } = await req.json();

    const client = await User.findOne({ clerkId: userId });
    const gig = await Gig.findOne({ _id: gigId, postedBy: client._id });

    if (!gig) {
      return NextResponse.json({ error: "Gig not found or unauthorized" }, { status: 404 });
    }

    // Delete all applications tied to this gig
    await Application.deleteMany({ gig: gigId });

    // Delete the gig
    await Gig.findByIdAndDelete(gigId);

    // Remove the gig reference from the client's posted gigs
    await User.findByIdAndUpdate(client._id, { $pull: { gigsPosted: gigId } });

    // return NextResponse.json({ message: "Gig deleted successfully" });
    return NextResponse.json({ message: 'Application removed' });

  } catch (error) {
    console.error("DELETE /api/client-gig error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
