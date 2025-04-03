import { sign, verify } from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';
import { TStudents } from 'src/students/students.entity';
import { config } from "dotenv";

config({ path: '.env' })

const secret = process.env.SECRET ?? "secret9090" as Secret;

export function setTokenFromPayload<T, E extends keyof T>(payload: Pick<T, E>) {
    return sign(payload, secret, { expiresIn: '30d' });
}

export function getPayloadFromToken(token: string) {
    try {
        return verify(token, secret);
    } catch (error) {
        throw error; 
    }
}