# 🚀 QuickGig — Full-Stack Freelance Marketplace with AI Chatbot

**QuickGig** is a production-ready, full-stack freelance marketplace where clients can post gigs and freelancers can apply to them. Designed to simulate platforms like Fiverr or Upwork — but built completely from scratch — it also includes a custom AI chatbot to assist users with queries about the platform.

## 🔗 Live Demo
[https://quick-gig-nextjs-fullstack-freelanc.vercel.app](https://quick-gig-nextjs-fullstack-freelanc.vercel.app)

## ✨ Features

### 🔐 Authentication
- Role-based authentication using **Clerk** (`Client` / `Freelancer`)
- Public metadata used to store user roles
- Redirect based on role after login

### 📝 Gigs & Applications
- Clients can post gigs with:
  - Title, description, skills, budget, deadline
- Freelancers can:
  - Browse gigs
  - Apply to gigs
  - Track application status (`Pending`, `Accepted`, `Rejected`)

### 💬 AI Chatbot
- Always-available floating button on every page
- Powered by **OpenRouter** with **Mistral-7B** model
- Custom system prompt trained to understand QuickGig context
- Helps users with:
  - Platform usage
  - Posting gigs
  - Applying and tracking status

### 🎨 UI/UX
- Fully responsive layout
- Clean, intuitive design with `Tailwind CSS`
- Framer Motion used for subtle animations

### 🧠 Tech Stack

| Category       | Technology                        |
|----------------|------------------------------------|
| Frontend       | Next.js (App Router)               |
| Styling        | Tailwind CSS                       |
| Auth           | Clerk                              |
| Backend API    | Route handlers (app/api)           |
| Database       | MongoDB + Mongoose                 |
| AI Chatbot     | OpenRouter (Mistral 7B)            |
| Deployment     | Vercel                             |

---

## 🛠️ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/nakul-3205/QuickGig-nextjs-fullstack-freelance-platform-with-chatbot
cd QuickGig-nextjs-fullstack-freelance-platform-with-chatbot
