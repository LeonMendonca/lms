import { sign, verify } from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';
import { TStudents } from 'src/students/students.entity';
import { config } from "dotenv";

config({ path: '.env' })

const secret = process.env.SECRET ?? "secret9090" as Secret;

export function setTokenFromPayload(payload: Pick<TStudents, 'email' | 'student_id'>) {
    return sign(payload, secret);
}

export function getPayloadFromToken(token: string) {
    try {
        return verify(token, secret);
    } catch (error) {
        throw error; 
    }
}