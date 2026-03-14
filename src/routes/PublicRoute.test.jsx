import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PublicRoute from './PublicRoute';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

function renderWithRouter(auth) {
  useAuth.mockReturnValue({ auth });

  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<div>Login Page</div>} />
        </Route>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PublicRoute', () => {
  it('renders child route when not authenticated', () => {
    renderWithRouter(null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to /dashboard when authenticated', () => {
    renderWithRouter({ access: 'valid-token' });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
