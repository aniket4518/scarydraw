 import {z} from 'zod'
export const UserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.email(),
  password :z.string(),
  name:z.string(),
})
export const singninSchema =z.object({
    username: z.string().min(3).max(20),
    password:z.string()
})
export const RoomName =z.object({
    roomname:z.string()
})