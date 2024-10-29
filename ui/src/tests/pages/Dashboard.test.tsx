import { render, screen } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard/Dashboard';

// Mock recharts components
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => children,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="xaxis" />,
    YAxis: () => <div data-testid="yaxis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />
}));

describe('Dashboard Component', () => {
    it('renders summary cards', () => {
        render(<Dashboard />);
        expect(screen.getByText('Active Agents')).toBeInTheDocument();
        expect(screen.getByText('Tasks Today')).toBeInTheDocument();
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
        expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
    });

    it('renders performance overview section', () => {
        render(<Dashboard />);
        expect(screen.getByText('Performance Overview')).toBeInTheDocument();
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('renders task distribution section', () => {
        render(<Dashboard />);
        expect(screen.getByText('Task Distribution')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
        expect(screen.getByText('Completed: 65%')).toBeInTheDocument();
        expect(screen.getByText('In Progress: 25%')).toBeInTheDocument();
        expect(screen.getByText('Failed: 10%')).toBeInTheDocument();
    });
});
