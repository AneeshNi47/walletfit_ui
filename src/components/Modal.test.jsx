import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  it('renders title and children', () => {
    render(
      <Modal title="Test Modal" onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    );

    // Click the overlay (outermost div)
    const overlay = container.firstChild;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    );

    fireEvent.click(screen.getByText('Content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('adds overflow-hidden to body on mount', () => {
    render(
      <Modal title="Test" onClose={() => {}}>
        <p>Content</p>
      </Modal>
    );

    expect(document.body.classList.contains('overflow-hidden')).toBe(true);
  });

  it('removes overflow-hidden from body on unmount', () => {
    const { unmount } = render(
      <Modal title="Test" onClose={() => {}}>
        <p>Content</p>
      </Modal>
    );

    unmount();
    expect(document.body.classList.contains('overflow-hidden')).toBe(false);
  });

  it('applies correct size class', () => {
    const { container } = render(
      <Modal title="Test" onClose={() => {}} size="lg">
        <p>Content</p>
      </Modal>
    );

    const modalContent = container.querySelector('.max-w-lg');
    expect(modalContent).toBeInTheDocument();
  });
});
