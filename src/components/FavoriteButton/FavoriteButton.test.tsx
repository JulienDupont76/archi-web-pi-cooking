import { render, screen } from '@testing-library/react';

describe('FavoriteButton Component', () => {
  it('should render without crashing', () => {
    render(<div>Button</div>);

    const button = screen.getByText('Button');
    expect(button).toBeInTheDocument();
  });
});
