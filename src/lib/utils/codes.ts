import { customAlphabet } from 'nanoid';

const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin caracteres ambiguos
const generateCode = customAlphabet(alphabet, 6);

export function generateClassCode(): string {
  return generateCode();
}

export function validateClassCode(code: string): boolean {
  if (!code || code.length !== 6) return false;
  return code.split('').every(char => alphabet.includes(char));
}