"use client"

import signin from "@/app/signin/page"
import { signIn, getSession } from "next-auth/react";

export function Authpage ({isSignin}:{isSignin:boolean}){
   const handleGoogleSignIn = async () => {
        try {
            await signIn("google", { callbackUrl: "/room" });
        } catch (error) {
            console.error("Google sign in failed", error);
        }
    };
    return(
        <div className="w-screen h-screen flex items-center justify-center absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 ">
          <div className="max-w-sm bg-white rounded-lg shadow-lg p-6 shadow-sm shadow-red-500/25 ">  
         <div className="m-2 p-2 bg-white rounded">
              <h1 className="text-4xl font-bold mb-4">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Start building your amazing project here!</p>
          {!isSignin && (
             
              <input
                type="text"
                placeholder="Name"
                className="bg-gray-200 mt-4 p-2 rounded text-black "
              />
            
          )}
            <input type ="text" placeholder="Email " className="bg-gray-200  white p-2  mt-6 rounded text-black"/>
         </div> 
         <div className="m-2 p-2 bg-white rounded">
            <input type ="password" placeholder="Password " className="bg-gray-200 p-2 white rounded text-black"/>
         </div>
           <button className="group bg-gradient-to-r from-red-600 to-orange-600 text-white m-4 px-6 py-4 rounded-lg text-lg    font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-90 flex items-center space-x-2 h-10">
              <span>{isSignin ? "signin" : "signup"}</span>
              </button>
           <button onClick={handleGoogleSignIn} className="group bg-gradient-to-r from-red-600 to-orange-600 text-white m-4 px-6 py-4 rounded-lg text-lg    font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-90 flex items-center space-x-2 h-10">
              <span> signin with google</span>
              </button>
          </div>     
        </div>
    )
}
