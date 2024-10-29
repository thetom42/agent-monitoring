import { render, screen } from '@testing-library/react';
import { Header } from '../../components/Header/Header';

describe('Header Component', () => {
    it('renders header title', () => {
        render(<Header />);
        const titleElement = screen.getByText(/Agent Monitoring/i);
        expect(titleElement).toBeInTheDocument();
    });

    it('renders navigation elements', () => {
        render(<Header />);
        const dashboardLink = screen.getByText(/Dashboard/i);
        expect(dashboardLink).toBeInTheDocument();
    });
});
