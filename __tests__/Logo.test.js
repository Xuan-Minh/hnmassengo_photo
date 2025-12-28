import { render, screen } from '@testing-library/react';
import TextReveal from '../components/TextReveal';

describe('TextReveal Component', () => {
  it('renders the text correctly', () => {
    render(<TextReveal text="Hello World" />);
    // Vérifie que les mots individuels sont présents
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('splits text into words', () => {
    const { container } = render(<TextReveal text="Hello Beautiful World" />);
    // Vérifie que les 3 mots sont présents
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Beautiful')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });
});
