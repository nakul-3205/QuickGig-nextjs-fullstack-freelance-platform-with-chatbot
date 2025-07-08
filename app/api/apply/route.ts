import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDBS from "@/lib/db";
import Application from "@/models/Application";
import Gig from "@/models/Gig";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectToDBS();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { gigId } = await req.json();

    const freelancer = await User.findOne({ clerkId: userId });
    if (!freelancer || freelancer.role !== "freelancer") {
      return NextResponse.json({ error: "Only freelancers can apply." }, { status: 403 });
    }

    const existingApp = await Application.findOne({ gig: gigId, freelancer: freelancer._id });
    if (existingApp) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    const application = await Application.create({
      gig: gigId,
      freelancer: freelancer._id,
      status: "pending"
    });

    //  Add the application ID to user's `applications` array
    await User.findByIdAndUpdate(freelancer._id, {
      $addToSet: { applications: application._id }
    });

    //  Add freelancer ID to gig's `applicants` array
    await Gig.findByIdAndUpdate(gigId, {
      $addToSet: { applicants: freelancer._id }
    });

    return NextResponse.json({ message: "Applied successfully", application });
  } catch (err) {
    console.error("Apply error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
