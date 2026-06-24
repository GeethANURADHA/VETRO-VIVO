// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import React from 'react';

afterEach(() => {
  cleanup();
});

// Mock the useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom components
vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => <div data-testid="navigate" data-to={to} />),
  Outlet: vi.fn(() => <div data-testid="outlet" />),
}));

describe('ProtectedRoute', () => {
  it('renders loading spinner when loading is true', () => {
    useAuth.mockReturnValue({
      user: null,
      role: null,
      loading: true,
    });

    render(<ProtectedRoute />);
    expect(screen.getByText('Verifying access...')).toBeDefined();
  });

  it('redirects to /login when user is not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      role: null,
      loading: false,
    });

    render(<ProtectedRoute />);
    const navigate = screen.getByTestId('navigate');
    expect(navigate).toBeDefined();
    expect(navigate.getAttribute('data-to')).toBe('/login');
  });

  it('redirects to / when user role is not allowed', () => {
    useAuth.mockReturnValue({
      user: { id: '123' },
      role: 'user',
      loading: false,
    });

    render(<ProtectedRoute allowedRoles={['admin', 'main_admin']} />);
    const navigate = screen.getByTestId('navigate');
    expect(navigate).toBeDefined();
    expect(navigate.getAttribute('data-to')).toBe('/');
  });

  it('renders Outlet when user is authenticated with allowed role', () => {
    useAuth.mockReturnValue({
      user: { id: '123' },
      role: 'admin',
      loading: false,
    });

    render(<ProtectedRoute allowedRoles={['admin', 'main_admin']} />);
    expect(screen.getByTestId('outlet')).toBeDefined();
  });
});
