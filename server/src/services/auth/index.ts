import { loginService } from "./login.service.js";
import { passwordService } from "./password.service.js";
import { registerService } from "./register.service.js";
import { sessionService } from "./session.service.js";

export const authService = {
    ...registerService,
    ...loginService,
    ...passwordService,
    ...sessionService,
};
