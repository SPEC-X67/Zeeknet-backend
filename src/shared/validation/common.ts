import { z } from 'zod';

/**
 * Common validation schemas to reduce duplication across DTOs
 */
export const commonValidations = {
  // Email validation
  email: z.string().email('Please enter a valid email address'),
  
  // Required string with minimum length
  requiredString: (minLength = 1, message?: string) => 
    z.string().min(minLength, message || `Must be at least ${minLength} character${minLength > 1 ? 's' : ''}`),
  
  // Optional URL validation
  optionalUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  
  // Required URL validation
  requiredUrl: z.string().url('Please enter a valid URL'),
  
  // Password validation
  password: z.string().min(6, 'Password must be at least 6 characters'),
  
  // Strong password validation
  strongPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  // Phone number validation
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  
  // Positive integer validation
  positiveInteger: z.number().int().positive('Must be a positive integer'),
  
  // Non-negative integer validation
  nonNegativeInteger: z.number().int().min(0, 'Must be a non-negative integer'),
  
  // Date validation
  date: z.string().datetime('Please enter a valid date'),
  
  // Optional date validation
  optionalDate: z.string().datetime('Please enter a valid date').optional(),
  
  // Boolean validation
  boolean: z.boolean(),
  
  // Optional boolean validation
  optionalBoolean: z.boolean().optional(),
  
  // Array validation with minimum items
  arrayWithMinItems: <T>(schema: z.ZodType<T>, minItems = 1) =>
    z.array(schema).min(minItems, `Must have at least ${minItems} item${minItems > 1 ? 's' : ''}`),
  
  // Pagination parameters
  pagination: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).default('10'),
  }),
  
  // Search parameter
  search: z.string().optional(),
  
  // Sort parameter
  sort: z.string().optional(),
  
  // Order parameter
  order: z.enum(['asc', 'desc']).optional(),
};

/**
 * Common field validations for forms
 */
export const fieldValidations = {
  // Company name validation
  companyName: z.string()
    .min(1, 'Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  
  // Person name validation
  personName: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  // Description validation
  description: z.string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  
  // Location validation
  location: z.string()
    .min(1, 'Location is required')
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters'),
  
  // Industry validation
  industry: z.string()
    .min(1, 'Industry is required')
    .min(2, 'Industry must be at least 2 characters')
    .max(50, 'Industry must be less than 50 characters'),
  
  // Employee count validation
  employeeCount: z.string()
    .min(1, 'Employee count is required')
    .refine((val) => {
      const validOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
      return validOptions.includes(val);
    }, 'Please select a valid employee count range'),
  
  // Tax ID validation
  taxId: z.string()
    .min(1, 'Tax ID is required')
    .min(3, 'Tax ID must be at least 3 characters')
    .max(20, 'Tax ID must be less than 20 characters'),
};

/**
 * Common query parameter builders
 */
export const queryBuilders = {
  // Build pagination query parameters
  pagination: (page: number, limit: number) => ({
    page: page.toString(),
    limit: limit.toString(),
  }),
  
  // Build search query parameters
  search: (searchTerm: string) => ({
    search: searchTerm,
  }),
  
  // Build filter query parameters
  filter: (filters: Record<string, unknown>) => {
    const queryParams: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = value.toString();
      }
    });
    return queryParams;
  },
  
  // Build sort query parameters
  sort: (field: string, order: 'asc' | 'desc' = 'asc') => ({
    sort: field,
    order: order,
  }),
};

/**
 * Common response builders
 */
export const responseBuilders = {
  // Build paginated response
  paginated: <T>(data: T[], pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }) => ({
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext,
      hasPrev: pagination.hasPrev,
    },
  }),
  
  // Build success response
  success: <T>(message: string, data: T, token?: string) => ({
    success: true,
    message,
    data,
    ...(token && { token }),
  }),
  
  // Build error response
  error: (message: string, data: unknown = null) => ({
    success: false,
    message,
    data,
  }),
};
