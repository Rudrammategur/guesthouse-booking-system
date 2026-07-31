import "./ERPForm.css";

function ERPFormModal({

    open,

    title,

    children,

    onSave,

    onClose,

    size = "md",

    saveText = "Save",

    cancelText = "Cancel",

    saving = false,

    showFooter = true

}) {

    if (!open) return null;

    return (

        <div className="modal-overlay">

            <div className={`erp-form-modal ${size}`}>

                <div className="erp-form-header">

                    <h2>{title}</h2>

                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>

                </div>

                <div className="erp-form-body">

                    {children}

                </div>

                {showFooter && (

                    <div className="erp-form-footer">

                        <button
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>

                        <button
                            className="save-btn"
                            onClick={onSave}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : saveText}
                        </button>

                    </div>

                )}

            </div>

        </div>

    );

}

export default ERPFormModal;