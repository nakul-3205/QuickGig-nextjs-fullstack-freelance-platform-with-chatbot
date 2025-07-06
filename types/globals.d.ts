export {}

// Create a type for the roles
export type Roles = 'freelancer' | 'client'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}