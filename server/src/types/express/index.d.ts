// server/src/types/express/index.d.ts
import 'express';
import { UserDocument } from "../../models/user/user.model.ts";

declare global {
    namespace Express {
        interface UserPermission {
            role?: string;
            id?: UserDocument["_id"];
            roleId?: UserDocument["roleId"];
            roleName?: string;
            sessionId?: string;
        }

        // Passport expects this interface
        interface User extends UserPermission { }

        interface Request {
            user?: User | null;
            requestId?: string;
        }
    }
}



declare module 'express' {
    export interface Request {
        file?: Express.Multer.File;
        files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
}