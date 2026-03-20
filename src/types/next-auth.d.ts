import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      role?: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role?: string;
    email: string;
    name: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
   role?: string; 
  }
}
