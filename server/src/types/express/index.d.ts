// server/src/types/express/index.d.ts
import { UserDocument } from "../../models/user.model.ts";
import 'express';
import { Multer } from 'multer';

declare global {
    namespace Express {
        interface UserPermission {
            role?: string;
            permissions?: string[];
            id?: UserDocument["_id"];
            extraPermissions?: UserDocument["extraPermissions"];
            roleId?: UserDocument["roleId"];
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