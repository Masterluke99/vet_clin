import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders application with navigation', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // This test checks if the navigation elements are present
  const homeLink = screen.getByText(/home/i);
  expect(homeLink).toBeInTheDocument();
});
