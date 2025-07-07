import mongoose from "mongoose";

const mongoDbUrl=process.env.MONGODB_URL!


if(!mongoDbUrl){
    console.log('MongoDb url error')
}
declare global {
  var mongoose: any;
}


let cached=global.mongoose || {conn:null,promise:null}
if (!global.mongoose) {
  global.mongoose = cached;
}


async function connectToDBS() {
    if(cached.conn){
        return cached.conn
    }
    if(!cached.promise){
        const opts = {
            bufferCommands: false,
        }
        cached.promise=mongoose.connect(mongoDbUrl,opts).then((mongooseInstance)=>{
            console.log('Database connected')
            return mongooseInstance
        })
    }
    try {
        cached.conn=await cached.promise
    } catch (error) {
        cached.promise=null
        throw error
    }
    return cached.conn
}

export default connectToDBS