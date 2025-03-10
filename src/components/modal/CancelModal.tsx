import Portal from "../portal/portal";
import { useState, useEffect, useRef, useContext } from "react";
import { CSSTransition } from "react-transition-group";
import "./modal.scss";
import useAppointmentService from "../../services/AppointmentService";
import { AppointmentContext } from "../../context/appointments/AppointmentsContext";

interface IModalProps {
    handleClose: (state: boolean) => void;
    selectedId: number;
    isOpen: boolean;
}

function CancelModal({ handleClose, selectedId, isOpen }: IModalProps) {
    const { getActiveAppointments } = useContext(AppointmentContext);
    const { cancelOneAppointment } = useAppointmentService();

    const nodeRef = useRef<HTMLDivElement>(null!);

    const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
    const [cancelStatus, setCancelStatus] = useState<boolean | null>(null);

    const cancelStatusRef = useRef<boolean | null>(cancelStatus);

    useEffect(() => {
        cancelStatusRef.current = cancelStatus;
    }, [cancelStatus]);

    const handleCancelAppointment = async (id: number) => {
        setBtnDisabled(true);
        cancelOneAppointment(id)
            .then(() => {
                setCancelStatus(true);
            })
            .catch(() => {
                console.log("Error, try again");
                setBtnDisabled(false);
                setCancelStatus(false);
            });
    };

    const closeModal = () => {
        handleClose(false);
        if (cancelStatusRef.current) {
            getActiveAppointments();
        }
    };

    const closeOnEscapeKey = (e: KeyboardEvent): void => {
        if (e.key === "Escape") {
            closeModal();
        }
    };
    useEffect(() => {
        document.addEventListener("keydown", closeOnEscapeKey);
        return () => {
            document.removeEventListener("keydown", closeOnEscapeKey);
        };
    }, [handleClose]);

    return (
        <Portal>
            <CSSTransition
                in={isOpen}
                timeout={{ enter: 500, exit: 500 }}
                unmountOnExit
                classNames="modal"
                nodeRef={nodeRef}
            >
                <div className="modal" ref={nodeRef}>
                    <div className="modal__body">
                        <span className="modal__title">
                            Are you sure you want to delete the appointment?
                            {selectedId}
                        </span>
                        <div className="modal__btns">
                            <button
                                className="modal__ok"
                                disabled={btnDisabled}
                                onClick={() => {
                                    handleCancelAppointment(selectedId);
                                }}
                            >
                                Ok
                            </button>
                            <button
                                className="modal__close"
                                onClick={() => closeModal()}
                            >
                                Close
                            </button>
                        </div>
                        <div className="modal__status">
                            {cancelStatus === null
                                ? ""
                                : cancelStatus
                                ? "Appointment canceled"
                                : "Error, try again"}
                        </div>
                    </div>
                </div>
            </CSSTransition>
        </Portal>
    );
}

export default CancelModal;
