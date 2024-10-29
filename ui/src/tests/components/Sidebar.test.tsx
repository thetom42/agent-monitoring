import { render, screen } from '@testing-library/react';
import Sidebar from '../../components/Sidebar/Sidebar';

describe('Sidebar Component', () => {
    it('renders navigation items when open', () => {
        render(<Sidebar open={true} />);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Analytics')).toBeInTheDocument();
        expect(screen.getByText('Resources')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders active agents section', () => {
        render(<Sidebar open={true} />);
        expect(screen.getByText('ACTIVE AGENTS')).toBeInTheDocument();
        expect(screen.getByText('Agent-1')).toBeInTheDocument();
        expect(screen.getByText('Agent-2')).toBeInTheDocument();
        expect(screen.getByText('Agent-3')).toBeInTheDocument();
    });

    it('renders system health section', () => {
        render(<Sidebar open={true} />);
        expect(screen.getByText('SYSTEM HEALTH')).toBeInTheDocument();
        expect(screen.getByText('CPU Usage')).toBeInTheDocument();
        expect(screen.getByText('Memory')).toBeInTheDocument();
        expect(screen.getByText('Network')).toBeInTheDocument();
    });
});
