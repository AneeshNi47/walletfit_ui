import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

// Mock axios
vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

import axios from '../api/axios';

// Helper component to test the auth context
function AuthTestConsumer() {
  const { auth, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {auth ? 'authenticated' : 'unauthenticated'}
      </div>
      {auth && (
        <div data-testid="auth-user">{auth.user?.username}</div>
      )}
      <button onClick={() => login(null, null, {
        access: 'test-access',
        refresh: 'test-refresh',
        user: { username: 'testuser' },
      })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts unauthenticated when no stored auth', () => {
    render(
      <AuthProvider>
        <AuthTestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
  });

  it('restores auth from localStorage', () => {
    localStorage.setItem('auth', JSON.stringify({
      access: 'stored-access',
      refresh: 'stored-refresh',
      user: { username: 'storeduser' },
    }));

    render(
      <AuthProvider>
        <AuthTestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('auth-user')).toHaveTextContent('storeduser');
  });

  it('sets auth state on login with token data', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthTestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByText('Login'));

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('auth-user')).toHaveTextContent('testuser');
  });

  it('persists auth to localStorage on login', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthTestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('auth'));
      expect(stored.access).toBe('test-access');
      expect(stored.user.username).toBe('testuser');
    });
  });

  it('clears auth state on logout', async () => {
    const user = userEvent.setup();

    localStorage.setItem('auth', JSON.stringify({
      access: 'test-access',
      refresh: 'test-refresh',
      user: { username: 'testuser' },
    }));

    axios.post.mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <AuthTestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');

    await user.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
      expect(localStorage.getItem('auth')).toBeNull();
    });
  });
});
