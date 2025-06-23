import cors from 'cors';
export declare class CORSHandler {
    static handle(): (req: cors.CorsRequest, res: {
        statusCode?: number | undefined;
        setHeader(key: string, value: string): any;
        end(): any;
    }, next: (err?: any) => any) => void;
}
//# sourceMappingURL=cors.d.ts.map