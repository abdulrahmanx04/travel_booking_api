import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    
    canActivate(context: ExecutionContext): boolean{
        
        const requiredRoles= this.reflector.get<string[]>('roles',context.getHandler())

        const request= context.switchToHttp().getRequest()

        const user= request.user

        return requiredRoles.includes(user.role)
    }
}