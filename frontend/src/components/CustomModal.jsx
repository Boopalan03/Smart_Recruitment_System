import { useEffect } from 'react'; // ✅ Import useEffect
import './CustomModal.css';

const CustomModal = ({ isOpen, type, title, message, onClose }) => {
    
    // ✅ NEW: Listen for "Enter" and "Escape" keys
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'Enter' || e.key === 'Escape') {
                e.preventDefault(); // Prevent accidental form submissions
                onClose();
            }
        };

        // Attach listener
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup listener when modal closes
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* stopPropagation prevents clicking inside the box from closing it */}
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

                {/* Button type="button" prevents form submission issues */}
                <button 
                    type="button" 
                    className={`modal-btn ${type}`} 
                    onClick={onClose}
                    autoFocus // ✅ Automatically focus this button so Enter works natively too
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default CustomModal;