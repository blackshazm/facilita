import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Ideally comes from env, but hardcoded fallback for example
const ENCRYPTION_KEY = process.env.DATABASE_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(text: string): string {
  const parts = text.split(':');
  if (parts.length !== 3) return text; // Not encrypted or malformed
  const [ivHex, authTagHex, encryptedHex] = parts;
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function encryptionMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    // Encrypt before query execution
    if (params.model === 'User' || params.model === 'ProviderProfile') {
      if (params.action === 'create' || params.action === 'update') {
        const data = params.args.data;
        if (data) {
          if (params.model === 'User' && data.phone && typeof data.phone === 'string') {
            data.phone = encrypt(data.phone);
          }
          if (params.model === 'ProviderProfile') {
            if (data.cpfCnpj && typeof data.cpfCnpj === 'string') data.cpfCnpj = encrypt(data.cpfCnpj);
            if (data.bankAccount && typeof data.bankAccount === 'string') data.bankAccount = encrypt(data.bankAccount);
            if (data.bankAccountDigit && typeof data.bankAccountDigit === 'string') data.bankAccountDigit = encrypt(data.bankAccountDigit);
            if (data.bankAccountType && typeof data.bankAccountType === 'string') data.bankAccountType = encrypt(data.bankAccountType);
            if (data.bankBranch && typeof data.bankBranch === 'string') data.bankBranch = encrypt(data.bankBranch);
            if (data.bankBranchDigit && typeof data.bankBranchDigit === 'string') data.bankBranchDigit = encrypt(data.bankBranchDigit);
          }
        }
      }
      
      // Where clauses for findUnique
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        const where = params.args.where;
        if (where) {
          if (params.model === 'User' && where.phone) where.phone = encrypt(where.phone);
          if (params.model === 'ProviderProfile' && where.cpfCnpj) where.cpfCnpj = encrypt(where.cpfCnpj);
        }
      }
    }

    const result = await next(params);

    // Decrypt after query execution
    if (result) {
      if (params.model === 'User') {
        if (Array.isArray(result)) {
           result.forEach(r => { if (r.phone) r.phone = decrypt(r.phone); });
        } else if (result.phone) {
           result.phone = decrypt(result.phone);
        }
      } else if (params.model === 'ProviderProfile') {
        if (Array.isArray(result)) {
           result.forEach(r => {
             if (r.cpfCnpj) r.cpfCnpj = decrypt(r.cpfCnpj);
             if (r.bankAccount) r.bankAccount = decrypt(r.bankAccount);
             if (r.bankAccountDigit) r.bankAccountDigit = decrypt(r.bankAccountDigit);
             if (r.bankAccountType) r.bankAccountType = decrypt(r.bankAccountType);
             if (r.bankBranch) r.bankBranch = decrypt(r.bankBranch);
             if (r.bankBranchDigit) r.bankBranchDigit = decrypt(r.bankBranchDigit);
           });
        } else {
             if (result.cpfCnpj) result.cpfCnpj = decrypt(result.cpfCnpj);
             if (result.bankAccount) result.bankAccount = decrypt(result.bankAccount);
             if (result.bankAccountDigit) result.bankAccountDigit = decrypt(result.bankAccountDigit);
             if (result.bankAccountType) result.bankAccountType = decrypt(result.bankAccountType);
             if (result.bankBranch) result.bankBranch = decrypt(result.bankBranch);
             if (result.bankBranchDigit) result.bankBranchDigit = decrypt(result.bankBranchDigit);
        }
      }
    }

    return result;
  };
}
