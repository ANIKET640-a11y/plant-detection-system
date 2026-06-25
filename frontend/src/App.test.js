import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import App from './App';

test('opens on the home page with primary navigation', () => {
  const container = document.createElement('div');
  act(() => {
    ReactDOM.render(<App />, container);
  });
  expect(container.textContent).toMatch(/Upload a leaf/i);
  expect(container.textContent).toMatch(/Search History/i);
  expect(container.textContent).toMatch(/PlantPulse AI/i);
  ReactDOM.unmountComponentAtNode(container);
});
