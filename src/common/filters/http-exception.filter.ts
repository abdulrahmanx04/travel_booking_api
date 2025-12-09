import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";



@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx= host.switchToHttp()
        const response= ctx.getResponse()
        let status: number= exception.getStatus()

        let message= exception.getResponse()

        const erroResponse=typeof message === 'string'
        ? {success: false, message}
        : {success: false, ...message}

        response.status(status).json({
            ...erroResponse,
            statusCode: status,
            timestamp: new Date().toISOString()
        })
    }
}