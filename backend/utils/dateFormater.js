exports.formatDate = (date) => {

    if (!date) return "-";

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(new Date(date));

};