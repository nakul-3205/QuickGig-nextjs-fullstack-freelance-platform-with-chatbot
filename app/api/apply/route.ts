import { NextRequest, NextResponse } from "next/server";
import connectToDBS from "@/lib/db";
import User from "@/models/User";
import Gig from "@/models/Gig";

export async function POST(req: NextRequest) {
  try {
    await connectToDBS();

    const { clerkId, gigId } = await req.json();

    if (!clerkId || !gigId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const user = await User.findOne({ clerkId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    //  Already applied?
    if (user.applications.includes(gigId)) {
      return NextResponse.json({ error: "Already applied to this gig" }, { status: 400 });
    }

    //  Max 5 applications?
    if (user.applications.length >= 5) {
      return NextResponse.json({ error: "Application limit reached" }, { status: 400 });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });

    //  Update both sides
    user.applications.push(gig._id);
    gig.applicants.push(user._id);

    await user.save();
    await gig.save();

    return NextResponse.json({ success: true, message: "Application submitted" }, { status: 200 });

  } catch (err) {
    console.error("[APPLY_ERROR]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
