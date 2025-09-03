import { NextFunction,Request,Response } from 'express';
import Jwt, { decode, JwtPayload } from  "jsonwebtoken";
import {JWT_SCERET} from "@repo/common/environment"
 

//   export function middleware (req:Request,res:Response,next:NextFunction)  {
//    try {
//     const token = req.headers.authorization ??""
//     const decoded = Jwt.verify(token, JWT_SCERET)    ;
//       if (decoded && typeof decoded === 'object' && 'userId' in decoded && typeof decoded.userId === 'string') {
        
      
//       req.userId= decoded.userId;
//       next();
//     } else {
//       res.status(401).json({ message: "Invalid token payload" });
//     }
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
//  }
  export function NextAuthmiddleware(req:Request,res:Response,next:NextFunction){
    const  NEXTAUTH_SECRET="hiiamaniket"
    console.log('=== NextAuth Middleware Called ===');
    console.log('NEXTAUTH_SECRET exists:', !!NEXTAUTH_SECRET);
    
    try{
      if(! NEXTAUTH_SECRET){
        console.log("NEXTAUTH_SECRET not found")
        return res.status(500).json({error: "NEXTAUTH_SECRET not configured"})
      }
      
      const token = req.headers.authorization ?? ""
      console.log("Received authorization header:", token ? "Token received" : "No token");

      if (!token) {
        console.log("No authorization token provided")
        return res.status(401).json({error: "No authorization token provided"})
      }

      // Verify JWT token
      const decoded = Jwt.verify(token, NEXTAUTH_SECRET) as JwtPayload
      console.log("JWT decoded successfully:", {
        userId: decoded.userId,
        email: decoded.email,
        exp: decoded.exp
      });
      
      if (decoded && typeof decoded === 'object' && 'userId' in decoded && typeof decoded.userId === 'string') {
        req.userId = decoded.userId;
         req.email=decoded.email
        console.log("User authenticated with userId:", req.userId);
        next()
      } else {
        console.log("Invalid token payload - no userId found")
        res.status(401).json({error: "Invalid token payload"})
      }
    }
    catch(err){
      console.error("JWT verification failed:", err);
      if (err instanceof Jwt.JsonWebTokenError) {
        res.status(401).json({error: "Invalid JWT token"})
      } else if (err instanceof Jwt.TokenExpiredError) {
        res.status(401).json({error: "JWT token expired"})
      } else {
        res.status(500).json({error: "Authentication error"})
      }
    }
  }