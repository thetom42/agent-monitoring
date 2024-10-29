import { render, screen } from '@testing-library/react';
import Header from '../../components/Header/Header';

describe('Header Component', () => {
    const mockOnMenuClick = jest.fn();

    it('renders header title', () => {
        render(<Header onMenuClick={mockOnMenuClick} />);
        const titleElement = screen.getByText(/AI Agent Monitor/i);
        expect(titleElement).toBeInTheDocument();
    });

    it('renders notification and settings icons', () => {
        render(<Header onMenuClick={mockOnMenuClick} />);
        expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/settings/i)).toBeInTheDocument();
    });
});
