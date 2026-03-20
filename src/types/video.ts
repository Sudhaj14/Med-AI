export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctor: {
    name: string;
    specialization: string;
    experience: number;
    rating: number;
    education: string;
    consultationFee: number;
  };
  date: string;
  time: string;
  reason: string;
  symptoms?: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  callStartTime?: string;
  callEndTime?: string;
  callDuration?: number;
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoCallParams {
  appointmentId: string;
  role: 'doctor' | 'patient';
}
