exports.isProjectFund = (expenditureHead) => {

    if (!expenditureHead)
        return false;

    return expenditureHead
        .trim()
        .toUpperCase() ===
        "PROJECT FUND";

};