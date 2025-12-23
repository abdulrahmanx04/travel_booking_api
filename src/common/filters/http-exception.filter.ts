import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";



@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx= host.switchToHttp() as Record<string, any>
        const response= ctx.getResponse() as Record<string, any>
        let status: number= exception.getStatus()

        let message= exception.getResponse()

        const errorResponse= typeof message === 'string'
        ? {success: false, message}
        : {success: false, ...message}

        response.status(status).json({
            ...errorResponse,
            statusCode: status,
            timestamp: new Date().toISOString()
        })
    }
}