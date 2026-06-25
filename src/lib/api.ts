import { auth } from './firebase.ts';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  } else {
    defaultHeaders['Authorization'] = 'Bearer dummy_dev_token';
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${response.status}`);
  }

  return response.json();
}
