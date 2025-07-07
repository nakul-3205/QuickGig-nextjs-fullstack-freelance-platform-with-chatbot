import User from "@/models/User";
import connectToDBS from "@/lib/db";
import { NextRequest,NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        await connectToDBS()
        const body=await req.json()
        const {clerkId,email,role}=body
        console.log(body)
        if (!clerkId || !email || !role) {
          console.log('reached loop')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    console.log('exited loop')
    if (await User.findOne({ clerkId: clerkId })) {
  return NextResponse.json({ message: 'User already exists' })
}
         console.log('reached user creation')
    const user = await User.findOneAndUpdate(
      { clerkId: clerkId },
      {
        email,
        role,
        onboardingComplete: false 
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );
    console.log('created user',user)
    return NextResponse.json({ success: true, user }, { status: 200 })

    } catch (error) {
         console.error('[USER_SYNC_ERROR]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  
    }
}