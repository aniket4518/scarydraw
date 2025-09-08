import 'dotenv/config';
import express from 'express'
import {prismaclient} from "@repo/db/client"
import { NextAuthmiddleware } from './middleware'
import { UserSchema ,singninSchema,RoomName} from "@repo/zod/userschema"
import  jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { JWT_SCERET} from '@repo/common/environment'
import cors from 'cors'
 
 const app =express()
 app.use(express.json())
app.use(cors())
const port =  process.env.PORT || 3001

console.log('Backend starting...');
console.log('NEXTAUTH_SECRET loaded:', !!process.env.NEXTAUTH_SECRET);

app.get ("/",(req,res)=>{

    res.json({message:"the server is working"})
    console.log("server is working ")
})

//  app.post("/signup",async(req,res)=>{
//   try{
//     const parsedData =  UserSchema.safeParse(req.body)
//     if(!parsedData.success){
//       res.json("incorrect data format")
//       return
//     }
//     const userexit = await prismaclient.user.findFirst({
//       where: {
//         email: parsedData.data.email
//       }
//     })
//     if(userexit){
//         res.json("user already exist")
//         return
//     }
//     const hashedpassword = await bcrypt.hash(parsedData.data.password,12)  
//     await prismaclient.user.create({
//       data:{
        
//         password:hashedpassword,
//         name: parsedData.data.name,
//         email: parsedData.data.email,
//       }
//     })
//     res.json("user created successfully")
//   }
//   catch(error){
//   res.status(400).json(
//     "something went wrong"
//   )
//  }

// })
// app.post("/signin", async(req,res)=>{
//     const parsedData= singninSchema.safeParse(req.body)
//     if (!parsedData.success){
//         res.json("incorrect input")
//         //if i didn't return here there might be null it means it exucte it even the data is not filleed
//         return
//     }
// try {
//      //password ko find kar ke compare 
//     const  user =await prismaclient.user.findFirst({
//       where :{
//       email:parsedData.data.email
//       }
//      })
//      if (!user){
//       res.json("user not found")
//       return
//      }
//      const passwordmatch = await bcrypt.compare (parsedData.data.password, user.password)
//      if (!passwordmatch){
//         res.json({ success: false, msg: "Incorrect Password"});
//           return;
//         }
//         const JWT = JWT_SCERET;
//          if (!JWT){
//       console.error("JWT_SCERET is undefined. Check env variable name.")
//       return res.status(500).json({msg:"server misconfigured"})
//     }   
//        const token =  jwt.sign({
//           userId: user.id
//         }, JWT);

//         res.json({ success: true, msg: "Logged in", token});

    

// }
// catch(error){
//    res.json( {  msg: "user unauthorized"})
// }
// })
// room creation
app.post ("/room",NextAuthmiddleware,async(req,res)=>{
     try{
         console.log("=== Room Creation Backend ===");
         const parssedData = RoomName.safeParse(req.body)
         console.log("Parsed room data:", parssedData)
         
         if(!parssedData.success){
          console.log("Room validation failed:", parssedData.error);
          res.status(400).json({error: "invalid input", details: parssedData.error})
          return
         }
         
         const userEmail = req.email
         console.log("User email from JWT:", userEmail);
         
         if(!userEmail){
          console.log("No user email found");
          res.status(401).json({msg:"user unauthorized"})
          return
         }

          
         const user = await prismaclient.user.findFirst({
           where: {
             email: userEmail
           }
         });

         if (!user) {
           console.log("User not found in database:", userEmail);
           res.status(401).json({msg:"user not found in database"})
           return
         }

         console.log("Found user:", user.id, user.email);
         const namematch = await prismaclient.room.findFirst({
          where:{
            name:parssedData.data.roomname
          }
         })
         if(namematch){
            res.status(402).json({msg:"same name already exist"})
            return
         }
 
         const room = await prismaclient.room.create({
           data:{
             name: parssedData.data.roomname,
             adminId: user.id  
           }
         })
         
         console.log("Room created successfully:", room);
         
         if(!room ){
          res.status(500).json({error: "room not created"})
          return
         }
         
         res.json(room.id)

     }
     catch(error){
       console.error("Room creation error:", error);
       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
       res.status(500).json({error: "Room creation failed", details: errorMessage})
     }
    
})
 
 // get all the rooms of user 
 app.get("/rooms", NextAuthmiddleware, async (req , res)=>{
       const userid = req.userId
       console.log("Getting rooms for user:", userid);
       
       if (!userid) {
         res.status(400).json({ msg: "invalid user id" })
         return
       }

       try {
         const rooms = await prismaclient.room.findMany({
           where:{
             adminId: userid
           }
         })
         if (!rooms){
          res.json("no rooms found     create a room first")
         }
         console.log("Found rooms:", rooms);
         res.json(rooms)
       } catch (error) {
         console.error("Error fetching rooms:", error)
         res.status(500).json({ msg: "Error fetching rooms" })
       }
 })

//getting messages of that room from db
app.get("/chats/:roomid",  async (req, res) => {
  const roomid = Number(req.params.roomid);
  if(typeof roomid !== 'number' ){
    res.status(400).json({msg:"invalid room id"})
    return
  }
  
  // Get all messages for this room through chats
  const messages = await prismaclient.message.findMany({
    where:{
      chat: {
        roomId: roomid
      }
    },
    orderBy :{
      createdAt:"asc"
    },
    take : 100
  })
  res.json(messages);
})
 

app.listen(port , ()=>{
    console.log (`server is running on port ${port}`)
})