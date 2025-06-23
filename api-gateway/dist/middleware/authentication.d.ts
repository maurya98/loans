import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: any;
    token?: string;
}
export declare class AuthenticationMiddleware {
    private static logger;
    static authenticate(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    static requireAuth(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    static requireRole(roles: string | string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    static requireScope(scopes: string | string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    private static extractToken;
    private static validateToken;
    private static isJWT;
    static validateJWT(token: string): any;
    private static validateAPIKey;
    static generateJWT(payload: any): string;
    static generateRefreshToken(payload: any): string;
}
//# sourceMappingURL=authentication.d.ts.map