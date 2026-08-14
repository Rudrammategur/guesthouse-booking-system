import Button from "../Common/Button/Button";

function BookingActions({
    booking,
    onView,
    onCancel,
    onEdit
}) {

    if (!booking) {
        return null;
    }

    switch (booking.BookingStatus) {

        case "Draft":

            return (
                <Button onClick={onEdit}>
                    Edit
                </Button>
            );


        case "Submitted":

            return (
                <div className="action-buttons">

                    <Button onClick={onView}>
                        View
                    </Button>

                    <Button
                        variant="danger"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>

                </div>
            );


        case "Approved":

            return (
                <div className="action-buttons">

                    <Button onClick={onView}>
                        View
                    </Button>

                </div>
            );


        case "Cancelled":

            return (
                <Button onClick={onView}>
                    View
                </Button>
            );


        default:

            return (
                <Button onClick={onView}>
                    View
                </Button>
            );
    }
}

export default BookingActions;