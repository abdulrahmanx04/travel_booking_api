import { PassportStrategy } from "@nestjs/passport";
import {Strategy,ExtractJwt} from 'passport-jwt'
import { Injectable } from "@nestjs/common";
import {  UserData } from "../interfaces/all-interfaces";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_ACCESS'),
            ignoreExpiration: false                     
        })
    }
    async validate(payload: any) {
        return {id: payload.id, role: payload.role} as UserData
    }
}



