import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private refelctor: Reflector) {}

    canActivate(context: ExecutionContext): boolean  {

        const requiredRoles= this.refelctor.getAllAndOverride<string[]>('roles',[context.getClass(),context.getHandler()])
        
        const request= context.switchToHttp().getRequest()

        return requiredRoles.includes(request.user.role)

    }
}