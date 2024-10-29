import { render, screen } from '@testing-library/react';
import { Dashboard } from '../../pages/Dashboard/Dashboard';

describe('Dashboard Page', () => {
    it('renders dashboard title', () => {
        render(<Dashboard />);
        const titleElement = screen.getByText(/Dashboard/i);
        expect(titleElement).toBeInTheDocument();
    });

    it('displays agent monitoring widgets', () => {
        render(<Dashboard />);
        const widgets = screen.getAllByTestId('monitoring-widget');
        expect(widgets.length).toBeGreaterThan(0);
    });

    it('shows agent status information', () => {
        render(<Dashboard />);
        const statusInfo = screen.getByTestId('agent-status-info');
        expect(statusInfo).toBeInTheDocument();
    });
});
