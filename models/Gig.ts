import mongoose from "mongoose";
import  { Schema, model, models } from "mongoose";
import User from "./User";

export interface IGig{
    title:string;
    description: string;
    category: string;
    budget: number;
    deadline: Date;
    status: 'open' | 'in_progress' | 'closed';
    postedBy: mongoose.Types.ObjectId;
    applicants?: mongoose.Types.ObjectId[];
    tags: [{ type: String }]


}

const gigSchema=new Schema <IGig>({
      title:{ type: String, required: true },
      description:{ type: String, required: true },
      category:{ type: String, required: true },
      budget:{ type: Number, required: true },
      deadline:{ type: Date, required: true },
      status:{ type: String, required: true ,enum:['open' , 'in_progress' , 'closed']},
      postedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
      applicants:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
       tags: [{ type: String }]

},{timestamps:true})

const Gig= models.Gig || model<IGig>('Gig',gigSchema)
export default Gig