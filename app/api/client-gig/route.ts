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

export async function get(req:NextRequest) {
    try {
         await connectToDBS()
         const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
      const  { title, description, category, budget, deadline, tags }= await req.json()
       const client = await User.findOne({ clerkId: userId });
    } catch (error) {
        
    }
}