// server/src/types/express/index.d.ts
import { UserDocument } from "../../models/user.model.ts";
import 'express';
import { Multer } from 'multer';

declare global {
    namespace Express {
        interface UserPermission {
            role?: string;
            id?: UserDocument["_id"];
            roleId?: UserDocument["roleId"];
            roleName?: string;
            sessionId?: string;
            permissions?: string[];
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