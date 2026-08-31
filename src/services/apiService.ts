import { UserProfile } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/auth';

export class ApiService {
  // Send OTP for Registration
  static async sendRegisterOtp(email: string, name: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('ApiService.sendRegisterOtp error:', err);
      return { success: false, message: 'Could not connect to authentication server.' };
    }
  }

  // Verify OTP & Register New Student
  static async verifyAndRegister(
    fullName: string,
    phone: string,
    email: string,
    password: string,
    otp: string
  ): Promise<{ success: boolean; message: string; user?: UserProfile; token?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/verify-otp-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, email, password, otp }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('ApiService.verifyAndRegister error:', err);
      return { success: false, message: 'Server connection error during registration.' };
    }
  }

  // User Sign In / Login
  static async loginUser(email: string, password: string): Promise<{ success: boolean; message?: string; user?: UserProfile; token?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('ApiService.loginUser error:', err);
      return { success: false, message: 'Server connection error during sign in.' };
    }
  }

  // Send Forgot Password Reset OTP
  static async sendForgotOtp(email: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/send-forgot-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('ApiService.sendForgotOtp error:', err);
      return { success: false, message: 'Could not connect to authentication server.' };
    }
  }

  // Reset Password with OTP
  static async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('ApiService.resetPassword error:', err);
      return { success: false, message: 'Server connection error during password reset.' };
    }
  }
}
