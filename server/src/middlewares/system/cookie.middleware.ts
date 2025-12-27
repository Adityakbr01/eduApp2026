import cookie from "cookie-parser"

export const cookieMiddleware = (app) => {
    app.use(cookie());
}