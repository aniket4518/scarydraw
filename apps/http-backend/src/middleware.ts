import { NextFunction,Request,Response } from 'express';
import Jwt from  "jsonwebtoken";
import JWT_SCERET from "@repo/common/environment"

  export function middleware (req:Request,res:Response,next:NextFunction)  {
   try {
    const token = req.headers.authorization ??""
    const decoded = Jwt.verify(token, JWT_SECRET) as { userid?: string };
    if (decoded && decoded.userid) {
      req.userId= decoded.userid;
      next();
    } else {
      res.status(401).json({ message: "Invalid token payload" });
    }
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
 }
  }