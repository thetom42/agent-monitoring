import { render, screen } from '@testing-library/react';
import { Sidebar } from '../../components/Sidebar/Sidebar';

describe('Sidebar Component', () => {
    it('renders sidebar menu items', () => {
        render(<Sidebar />);
        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems.length).toBeGreaterThan(0);
    });

    it('displays agent status section', () => {
        render(<Sidebar />);
        const statusSection = screen.getByText(/Agent Status/i);
        expect(statusSection).toBeInTheDocument();
    });
});
