'use client';

import { useState, useEffect, useRef } from 'react';

export default function Modal({ isOpen, title, message, onConfirm, onCancel, placeholder = '', children }) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && !children) {
            setInputValue('');
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, children]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(inputValue);
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                <button
                    type="button"
                    onClick={onCancel}
                    aria-label="Close"
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        lineHeight: 1,
                        cursor: 'pointer',
                        color: 'var(--foreground)',
                        padding: 0,
                    }}
                >
                    &times;
                </button>
                <h2>{title}</h2>
                {message && <p>{message}</p>}

                {children ? (
                    children
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            ref={inputRef}
                            type="text"
                            className="form-control"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={placeholder}
                            style={{ marginBottom: '1rem' }}
                        />
                        <div className="modal-actions">
                            <button type="button" className="btn" style={{ background: '#666' }} onClick={onCancel}>
                                Cancel
                            </button>
                            <button type="submit" className="btn">
                                Confirm
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
