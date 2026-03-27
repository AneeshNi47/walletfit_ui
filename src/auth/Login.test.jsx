import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByText('Sign in to FynBee')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('submits form with username and password', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce();

    renderLogin();

    await user.type(screen.getByPlaceholderText('admin@example.com'), 'testuser');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByText('Login'));

    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
  });

  it('navigates to /dashboard on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce();

    renderLogin();

    await user.type(screen.getByPlaceholderText('admin@example.com'), 'testuser');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLogin();

    await user.type(screen.getByPlaceholderText('admin@example.com'), 'wronguser');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });
  });

  it('shows loading state while logging in', async () => {
    const user = userEvent.setup();
    // Make login hang so we can check loading state
    mockLogin.mockImplementation(() => new Promise(() => {}));

    renderLogin();

    await user.type(screen.getByPlaceholderText('admin@example.com'), 'testuser');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByText('Login'));

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });

  it('has a link to register page', () => {
    renderLogin();
    const registerLink = screen.getByText('Register here');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
});
