export function getUserHeader() {

    const user =
        JSON.parse(
            localStorage.getItem("currentUser")
        );

    return {

        "x-user-data":
            JSON.stringify(user)

    };

}