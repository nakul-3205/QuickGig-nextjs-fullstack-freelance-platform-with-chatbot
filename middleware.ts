import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { use } from 'react'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)'
])
export default clerkMiddleware(async (auth, req) => {
  const {userId,sessionClaims}=await auth()
  const role = sessionClaims?.metadata?.role
  // console.log(role)
  if(!userId && !isPublicRoute(req)){
    const url = new URL('/sign-up',req.url)
    return NextResponse.redirect(url)
  }
  if(userId && isPublicRoute(req)){
     if(role==='freelancer'){
       const url = new URL('/freelancer/dashboard',req.url)
    return NextResponse.redirect(url)
     }
     else if(role==='client'){
       const url = new URL('/client/dashboard',req.url)
    return NextResponse.redirect(url)
     }
  }
  const path = req.nextUrl.pathname;
  if(userId && role && path==='/select-role'){
    console.log('reacheddd here')
    const url = new URL(`/${role}/dashboard`,req.url)
    return NextResponse.redirect(url)
  }
  
  if(userId && !role && path!=='/select-role'){
    
    const url = new URL('/select-role',req.url)
    return NextResponse.redirect(url)
  

  }

  if(role==='freelancer'&& path.startsWith('/client')){
    const url = new URL('/freelancer/dashboard',req.url)
    return NextResponse.redirect(url)
  }
   if(role==='client'&& path.startsWith('/freelancer')){
    const url = new URL('/client/dashboard',req.url)
    return NextResponse.redirect(url)
  }
  
   if (userId && role && (path === '/sign-in' || path === '/sign-up')) {
  const url = new URL(`/${role}/dashboard`, req.url)
  return NextResponse.redirect(url)
}



})
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}