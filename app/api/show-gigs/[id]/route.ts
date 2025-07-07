import { NextRequest, NextResponse } from "next/server"
import connectToDBS from "@/lib/db"
import Gig from "@/models/Gig"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDBS()

    const gig = await Gig.findById(params.id).populate('postedBy', 'email') 

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 })
    }

    return NextResponse.json({ gig }, { status: 200 })
  } catch (error) {
    console.error("[GET_GIG_BY_ID_ERROR]", error)
    return NextResponse.json({ error: "Failed to fetch gig details" }, { status: 500 })
  }
}