const { fileTypeFromBuffer } = require("file-type");

const getSupportingDocument = async ({
    pool,
    sql,
    tableName,
    idColumn,
    idValue,
    documentColumn = "SupportingDoc"
}) => {

    const result = await pool.request()
        .input("ID", sql.VarChar, idValue)
        .query(`
            SELECT ${documentColumn}
            FROM ${tableName}
            WHERE ${idColumn} = @ID
              AND IsActive = 1
        `);

    if (result.recordset.length === 0) {

        const error = new Error(
            "Application not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const document =
        result.recordset[0][documentColumn];

    if (!document) {

        const error = new Error(
            "No supporting document found"
        );

        error.statusCode = 404;

        throw error;
    }

    const buffer = Buffer.from(document);

    const type =
        await fileTypeFromBuffer(buffer);

    return {
        buffer,
        mimeType:
            type?.mime ||
            "application/octet-stream"
    };
};

module.exports = {
    getSupportingDocument
};