import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDBS from "@/lib/db";
import Gig from "@/models/Gig";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
  try {
    await connectToDBS();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gigId, title, description, category, budget, deadline } = await req.json();

    const client = await User.findOne({ clerkId: userId });
    if (!client || client.role !== "client") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const gig = await Gig.findOne({ _id: gigId, postedBy: client._id });
    if (!gig) {
      return NextResponse.json({ error: "Gig not found or not owned by you" }, { status: 404 });
    }

    if (title) gig.title = title;
    if (description) gig.description = description;
    if (category) gig.category = category;
    if (budget) gig.budget = budget;
    if (deadline) gig.deadline = new Date(deadline);

    await gig.save();

    return NextResponse.json({ message: "Gig updated successfully", gig });

  } catch (err) {
    console.error("PUT /api/edit-gig error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
