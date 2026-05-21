const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auth API calls
export const authAPI = {
  register: async (data: { name: string; email: string; password: string; role: string }) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  verifyOTP: async (data: { userId: string; otp: string }) => {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getProfile: async (token: string) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  updateProfile: async (token: string, data: any) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
// Document API calls
export const documentAPI = {
  upload: async (token: string, formData: FormData) => {
    const response = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },

  getAll: async (token: string) => {
    const response = await fetch(`${API_URL}/documents`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  sign: async (token: string, id: string, signature: string) => {
    const response = await fetch(`${API_URL}/documents/${id}/sign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ signature }),
    });
    return response.json();
  },
};

// Meeting API calls
export const meetingAPI = {
  schedule: async (token: string, data: object) => {
    const response = await fetch(`${API_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getAll: async (token: string) => {
    const response = await fetch(`${API_URL}/meetings`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  accept: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/meetings/${id}/accept`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  reject: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/meetings/${id}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};
export const paymentAPI = {
  deposit: async (token: string, amount: number, description: string) => {
    const response = await fetch(`${API_URL}/payments/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, description }),
    });
    return response.json();
  },

  withdraw: async (token: string, amount: number, description: string) => {
    const response = await fetch(`${API_URL}/payments/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, description }),
    });
    return response.json();
  },

  getTransactions: async (token: string) => {
    const response = await fetch(`${API_URL}/payments/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};
export const usersAPI = {
  getByRole: async (token: string, role: string) => {
    const response = await fetch(`${API_URL}/auth/users/${role}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};