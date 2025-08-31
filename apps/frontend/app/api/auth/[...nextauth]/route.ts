import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prismaclient } from "@repo/db/client";
 
const githubclientId= process.env.GitHub_ClientId!
const githubsecret =process.env.GitHub_ClientSecret!
 
const  Google_ClientId=process.env.Google_ClientId! 

const oogle_ClientSecret=process.env.Google_ClientSecret!
 
const handler = NextAuth({
     
  providers: [
    Google({
      clientId: Google_ClientId,
      clientSecret: oogle_ClientSecret
    }),
    Github({
      clientId: githubclientId,
      clientSecret: githubsecret
    })
  ],
    session:{
        strategy:"jwt",
    },
    callbacks:{
       async jwt({ token, user,profile  }) {
        
       if (user&& user.email && user.name) {
    
        // if user exist in db
      let dbUser =await prismaclient.user.upsert({
         where: {
             email: user.email 
             }, 
            create:{
             email: user.email,
             name: user.name,
             photo:user.image
            },
             update:{
               name:user.name as string ,
                photo:user.image
             }
            });
     // if user does not exist in db
    //  if (!dbUser) {
    //   dbUser = await prismaclient.user.create({
    //     data: {
    //          email: user.email,
    //          name: user.name
             
    //          },
    //   });
    // }

    token.id = dbUser.id;
  }
   console.log("roken",token)
  return token;
  
},


   async session({ session, token ,user}) {
      if (token?.id && session.user) {
        // Extend the user object to include id
        (session.user as typeof session.user & { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
});
 
export { handler as GET, handler as POST };
