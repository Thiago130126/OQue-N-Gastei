'use client';
import React from "react";

interface ModalProps{
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps){
    if(!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                position: 'relative', minWidth: '300px'
            }}>
                <button 
                    onClick={onClose} 
                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                >
                    X
                </button>
                {children}
            </div>
        </div>
    );
}