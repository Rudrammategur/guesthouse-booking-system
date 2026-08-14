// import { useEffect, useState } from "react";
// import UserContext from "./UserContext";
// import api from "../api/axios";

// function UserProvider({ children }) {

//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const loadUser = async () => {

//         try {

//             const employeeName =
//                 window.top.document
//                     .querySelector("#spnUserName")
//                     ?.innerText
//                     ?.trim();

//             const res = await api.get("/api/user/me", {
//                 params: {
//                     name: employeeName
//                 }
//             });

//             setUser(res.data.data);
//             window.currentUser = res.data.data;

//         } catch (err) {

//             console.error(err);

//         } finally {

//             setLoading(false);

//         }
//     };

//     useEffect(() => {
//         loadUser();
//     }, []);

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     return (
//         <UserContext.Provider
//             value={{
//                 user,
//                 reloadUser: loadUser
//             }}
//         >
//             {children}
//         </UserContext.Provider>
//     );
// }

// export default UserProvider;


import { useEffect, useState } from "react";
import UserContext from "./UserContext";
import api from "../api/axios";

function UserProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {

        try {

            const employeeName =
                window.top.document
                    .querySelector("#spnUserName")
                    ?.innerText
                    ?.trim();

            if (!employeeName) {

                throw new Error(
                    "Unable to identify the logged-in user."
                );

            }

            const res =
                await api.get(
                    "/api/user/me",
                    {
                        params: {
                            name: employeeName
                        }
                    }
                );

            setUser(
                res.data.data
            );

            /*
             * Keep this if your existing transportApi
             * and other interceptors use window.currentUser.
             */
            window.currentUser =
                res.data.data;

            /*
             * Also persist the current user because
             * transportApi now reads localStorage.
             */
            localStorage.setItem(
                "currentUser",
                JSON.stringify(
                    res.data.data
                )
            );

        }

        catch (err) {

            console.error(
                "Failed to load current user:",
                err
            );

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadUser();

    }, []);


    if (loading) {

        return (
            <div>
                Loading...
            </div>
        );

    }


    return (

        <UserContext.Provider
            value={{
                user,
                reloadUser: loadUser
            }}
        >
            {children}
        </UserContext.Provider>

    );

}

export default UserProvider;