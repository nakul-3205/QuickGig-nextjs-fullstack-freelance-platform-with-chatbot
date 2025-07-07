import { NextRequest, NextResponse } from "next/server"
import connectToDBS from "@/lib/db"
import Gig from "@/models/Gig"


export async function GET(req:NextRequest) {
    try {
        await connectToDBS()
        const gigs= await Gig.find({ status: 'open' }).sort({ createdAt: -1 })
         return NextResponse.json({ gigs }, { status: 200 })
    } catch (error) {
         console.error("[GET_GIGS_ERROR]", error)
         return NextResponse.json({ error: "Failed to fetch gigs" }, { status: 500 })
    }
}