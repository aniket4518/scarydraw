"use client"

import signin from "@/app/(header)/signin/page"
import { Icon } from "lucide-react";
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
           <button onClick={handleGoogleSignIn} className="group bg-white border border-gray-300 text-black m-4 px-6 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-gray-500/25 transition-all duration-300 hover:scale-95 flex items-center space-x-3 h-12">
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
              <span>Sign in with Google</span>
              </button>
          </div>     
        </div>
    )
}
