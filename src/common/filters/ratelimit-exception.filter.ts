import { 
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus 
    } from "@nestjs/common";
import { ThrottlerException } from "@nestjs/throttler";




@Catch(ThrottlerException)
export class ThrottlerFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const response= host.switchToHttp().getResponse()

        response.status(HttpStatus.TOO_MANY_REQUESTS).json({
            success: false,
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests. Please try again later.',
            error: 'RateLimitExceeded',
            timestamp: new Date().toISOString()
        })
    }
}
