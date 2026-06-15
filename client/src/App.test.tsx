import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock dependencies
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({ user: { id: '1', name: 'Test User' }, isLoading: false })
}));

describe('App', () => {
  it('renders CarbonIQ correctly', () => {
    // Render the App component
    render(<App />);
    
    // Check if the sidebar navigation renders
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
