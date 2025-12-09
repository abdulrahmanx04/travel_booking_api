import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthRequest } from "../interfaces/all-interfaces";



export const CurrentUser= createParamDecorator(
    (data: any, ctx: ExecutionContext)  => {
        const request= ctx.switchToHttp().getRequest<AuthRequest>()
        return request.user
    }
)