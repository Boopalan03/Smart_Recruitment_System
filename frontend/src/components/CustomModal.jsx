import { useEffect } from 'react'; // ✅ Import useEffect
import './CustomModal.css';

const CustomModal = ({ isOpen, type, title, message, onClose, showCancel = false, onConfirm = null }) => {
    
    // ✅ Listen for "Enter" and "Escape" keys
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (showCancel && onConfirm) {
                    onConfirm();
                }
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, showCancel, onConfirm]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                <div className={`modal-header ${type}`}>
                    {type === 'success' && '✅ Success'}
                    {type === 'error' && '❌ Error'}
                    {type === 'info' && 'ℹ️ Notice'}
                    {title && ` - ${title}`}
                </div>

                <div className="modal-body">
                    {message}
                </div>

                <div className="modal-actions">
                    {showCancel ? (
                        <>
                            <button 
                                type="button" 
                                className="modal-btn cancel-btn" 
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className={`modal-btn ${type}`} 
                                onClick={() => {
                                    if (onConfirm) onConfirm();
                                    onClose();
                                }}
                                autoFocus
                            >
                                Confirm
                            </button>
                        </>
                    ) : (
                        <button 
                            type="button" 
                            className={`modal-btn ${type}`} 
                            onClick={onClose}
                            autoFocus
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomModal;