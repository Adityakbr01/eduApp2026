// server/src/types/express/index.d.ts
import 'express';
import { UserDocument } from "../../models/user.model.ts";

declare global {
    namespace Express {
        interface UserPermission {
            role?: string;
            id?: UserDocument["_id"];
            roleId?: UserDocument["roleId"];
            roleName?: string;
            sessionId?: string;
        }

        interface Request {
            user?: UserPermission | null;
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