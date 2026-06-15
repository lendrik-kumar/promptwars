import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GreenWallet from './GreenWallet';
import * as api from '../api/client';

// Mock framer-motion to skip animations
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock('../api/client', async () => {
  const actual = await vi.importActual('../api/client');
  return {
    ...actual,
    getWallet: vi.fn(),
  };
});

describe('GreenWallet Component', () => {
  it('shows loading state initially', () => {
    vi.mocked(api.getWallet).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100))
    );
    render(<GreenWallet />);
    // Loading skeleton should have stack-lg class
    const skeletons = document.getElementsByClassName('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders wallet stats when loaded successfully', async () => {
    const mockWallet = {
      sessionId: 'test-session',
      totalCO2SavedKg: 15.5,
      totalMoneySavedINR: 450,
      swapsCompleted: 3,
      swapHistory: [],
      milestone: {
        current: null,
        next: { threshold: 500, name: 'Green Starter', badge: '🌱', reward: '10% off', amountToGo: 50 },
      },
    };

    vi.mocked(api.getWallet).mockResolvedValue(mockWallet);
    render(<GreenWallet />);

    await waitFor(() => {
      expect(screen.getByText('Green Wallet 💚')).toBeInTheDocument();
      expect(screen.getByText('₹450')).toBeInTheDocument();
      expect(screen.getByText('15.5')).toBeInTheDocument(); // CO2 Avoided
      expect(screen.getByText('3')).toBeInTheDocument(); // swaps completed
    });
  });

  it('shows error state when API fails', async () => {
    vi.mocked(api.getWallet).mockRejectedValue(new Error('API failure'));
    render(<GreenWallet />);

    await waitFor(() => {
      expect(screen.getByText(/API failure/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});
