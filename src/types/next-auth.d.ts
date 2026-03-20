import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: 'patient' | 'doctor'; // ✅ ONLY this
      specialization?: string;
      experience?: number;
      consultationFee?: number;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'patient' | 'doctor'; // ✅ ONLY this
    specialization?: string;
    experience?: number;
    consultationFee?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'patient' | 'doctor';
    specialization?: string;
    experience?: number;
    consultationFee?: number;
  }
}