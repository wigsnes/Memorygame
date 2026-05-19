import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders title and game controls', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /memory match/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mode/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument();
  });

  it('renders card grid with 16 cards on easy', () => {
    render(<App />);
    const cards = screen.getAllByRole('button', { name: /card/i });
    expect(cards.length).toBeGreaterThanOrEqual(16);
  });

  it('shows highscore section', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /top 10 highscores/i })).toBeInTheDocument();
  });

  it('shows trophies section', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /trophies/i })).toBeInTheDocument();
  });
});
