 import {z} from 'zod'
export const UserSchema = z.object({ 
   email: z.string().email(),
  password :z.string(),
  name:z.string(),
})
export const singninSchema =z.object({
    
    password:z.string(),
    email: z.string().email(),
})
export const RoomName =z.object({
    roomname:z.string()
})