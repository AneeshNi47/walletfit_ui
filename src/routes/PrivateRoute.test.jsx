import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

function renderWithRouter(auth) {
  useAuth.mockReturnValue({ auth });

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PrivateRoute', () => {
  it('renders child route when authenticated', () => {
    renderWithRouter({ access: 'valid-token', refresh: 'refresh-token' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderWithRouter(null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when auth has no access token', () => {
    renderWithRouter({ refresh: 'refresh-token' });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
