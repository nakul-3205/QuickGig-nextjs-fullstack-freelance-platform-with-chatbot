import mongoose from "mongoose";
import  { Schema, model, models } from "mongoose";


export interface IUser{
    clerkId:string
    name:string;
    email:string;
    password?:string,
    role: 'freelancer' | 'client';
    bio?:string;
    skills?:string[];
    applications?: mongoose.Types.ObjectId[];
    gigsPosted?: mongoose.Types.ObjectId[];
    

}

const userSchema=new Schema <IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['freelancer', 'client'], required: true },
    bio: { type: String },
    skills: [String],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    gigsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gig' }],
    clerkId: { type: String, required: true, unique: true }


},{timestamps:true})
const User= models.User || model<IUser>('User',userSchema)
export default User