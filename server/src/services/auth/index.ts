import { loginService } from "./login.service.js";
import { passwordService } from "./password.service.js";
import { registerService } from "./register.service.js";
import { sessionService } from "./session.service.js";
import { oauthService } from "./oauth.service.js";

export const authService = {
    ...registerService,
    ...loginService,
    ...passwordService,
    ...sessionService,
    ...oauthService,
};
