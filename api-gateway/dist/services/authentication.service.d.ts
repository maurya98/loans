import { User } from '../models/user.entity';
export interface AuthResult {
    valid: boolean;
    user?: User;
    error?: string;
}
export declare class AuthenticationService {
    private logger;
    private databaseService;
    private userRepository;
    private apiKeyRepository;
    constructor();
    private getUserRepository;
    private getApiKeyRepository;
    validateToken(token: string): Promise<AuthResult>;
    authenticateUser(username: string, password: string): Promise<AuthResult>;
    createUser(userData: Omit<User, 'id' | 'password' | 'createdAt' | 'updatedAt'> & {
        password: string;
    }): Promise<User>;
    updateUser(id: string, update: Partial<User>): Promise<User | undefined>;
    deleteUser(id: string): Promise<boolean>;
    getUserById(id: string): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
    validateApiKey(apiKey: string): Promise<AuthResult>;
    validateOAuth2Token(token: string): Promise<AuthResult>;
    generateJWT(user: User): string;
    generateRefreshToken(user: User): string;
    hasPermission(user: User, permission: string): Promise<boolean>;
    hasRole(user: User, role: string): Promise<boolean>;
    private updateLastLogin;
}
//# sourceMappingURL=authentication.service.d.ts.map