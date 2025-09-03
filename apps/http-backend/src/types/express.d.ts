 
    declare global {
      namespace Express {
        interface Request {
          user?: {  
            id: string;
            email: string;
        
          };
          context?: any;  
         userId:string;
         email:string;
        }
      }
    }
    export{}