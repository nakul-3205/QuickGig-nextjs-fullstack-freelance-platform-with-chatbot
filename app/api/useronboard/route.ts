import User from "@/models/User";
import connectToDBS from "@/lib/db";
import { NextRequest,NextResponse } from "next/server";

export async function POST(req:NextRequest) {
   console.log('[API] /api/onboard-user hit ')
   console.log(req.json)
    try {
        await connectToDBS()
       const body= await req.json()
         const { clerkId, bio, skills, portfoliosite } = body
             console.log(body)
          if (!clerkId || !bio || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      {
        bio,
        skills,
        portfoliosite: portfoliosite || '', // Optional
        onboardingComplete: true
      },
      { new: true }
    )
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 })
    } catch (error) {
         console.error('[ONBOARD_USER_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}