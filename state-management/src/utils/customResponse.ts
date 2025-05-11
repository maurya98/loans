import responseMessage from '../config/responseMessage';
type ResponseKey = keyof typeof responseMessage;

interface ResponseObject {
    status: boolean,
    statusCode: number,
    statusMessage: string
    data: any
}

export class CustomResponse {
    public static build(key: ResponseKey, responseData?: any): ResponseObject {
        const responseObject = responseMessage[key];
        return {
            status: key === "SUCCESS",
            statusCode:  responseObject.statusCode ?? 400,
            statusMessage: responseObject?.message ?? 'ERROR',
            data: responseData ?? {}
        }
    }
}
