import { NextFunction,Request,Response } from 'express';
import Jwt, { JwtPayload } from  "jsonwebtoken";
import {JWT_SCERET} from "@repo/common/environment"

  export function middleware (req:Request,res:Response,next:NextFunction)  {
   try {
    const token = req.headers.authorization ??""
    const decoded = Jwt.verify(token, JWT_SCERET)    ;
      if (decoded && typeof decoded === 'object' && 'userId' in decoded && typeof decoded.userId === 'string') {
        
      
      req.userId= decoded.userId;
      next();
    } else {
      res.status(401).json({ message: "Invalid token payload" });
    }
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
 }
  