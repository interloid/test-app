import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

/**
 * =============================================================================
 * 1. User Registration Data Transfer Object
 * =============================================================================
 */
export class RegisterDto {
  @ApiProperty({
    description: 'Unique email address identity for user login profiles',
    example: 'developer@interloid.com',
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    description:
      'Cryptographic access password (min 8 chars, 1 upper, 1 special)',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 64,
  })
  password!: string;

  @ApiProperty({
    description: 'Public display name of the employee user profile',
    example: 'Navaneethan',
    minLength: 2,
    maxLength: 50,
  })
  name!: string;
}

// Accompanying Zod Runtime Validation Schema matching the structural layout of the class
export const registerSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(64),
  name: z.string().min(2).max(50).trim(),
});

/**
 * =============================================================================
 * 2. User Login Data Transfer Object
 * =============================================================================
 */
export class LoginDto {
  @ApiProperty({
    description: 'Registered user email address',
    example: 'developer@interloid.com',
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    description: 'Plaintext security access credential',
    example: 'SecurePassword123!',
  })
  password!: string;
}

// Accompanying Zod Runtime Validation Schema matching the structural layout of the class
export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
});

/**
 * =============================================================================
 * Profile Update Data Transfer Object
 * =============================================================================
 */
export class UpdateProfileDto {
  @ApiProperty({
    description: 'The updated public display name of the user profile',
    example: 'Navaneethan K',
    minLength: 2,
    maxLength: 50,
  })
  name: string = '';
}

// Accompanying Zod Runtime Validation Schema
export const updateProfileSchema = z.object({
  name: z
    .string({ error: 'Name parameter is required' })
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
});
