import { loginService } from "./auth/login.service.js";
import { passwordService } from "./auth/password.service.js";
import { registerService } from "./auth/register.service.js";
import { sessionService } from "./auth/session.service.js";

export const authService = {
    ...registerService,
    ...loginService,
    ...passwordService,
    ...sessionService,
};
