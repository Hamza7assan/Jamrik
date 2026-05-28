import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Dummy component for testing purposes
const DummyComponent = () => {
  return (
    <div>
      <h1>Integration Test</h1>
    </div>
  )
}

describe('Sample Integration Test', () => {
  it('should render the component', () => {
    render(<DummyComponent />)
    const heading = screen.getByRole('heading', { name: /Integration Test/i })
    expect(heading).toBeInTheDocument()
  })
})
