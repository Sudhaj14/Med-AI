import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      role?: string;
      name?: string | null;
      image?: string | null;
      role: 'patient' | 'doctor';
    };
  }

  interface User {
    id: string;
    role?: string;
    email: string;
    name: string;
     role: 'patient' | 'doctor';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'patient' | 'doctor'; 
  }
}
