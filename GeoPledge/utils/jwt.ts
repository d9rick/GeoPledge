// utils/jwt.ts
import { jwtDecode } from 'jwt-decode';

export function getUserIdFromToken(token: string): string | null {
    try {
        const payload: any = jwtDecode(token);
        // If you used the "sub" claim for the UUID:
        return payload.sub ?? null;
    } catch {
        return null;
    }
}