// import axios from "axios";

// const transportApi = axios.create({
//     baseURL:
//         import.meta.env.VITE_TRANSPORT_API_URL ||
//         "/transport-api"
// });

// transportApi.interceptors.request.use(config => {

//     console.log("Transport Interceptor User:", window.currentUser);

//     if (window.currentUser) {

//         config.headers["x-user-data"] =
//             JSON.stringify(window.currentUser);

//     }

//     return config;

// });

// export default transportApi;


import axios from "axios";

const transportApi = axios.create({
    baseURL:
        import.meta.env.VITE_TRANSPORT_API_URL ||
        "/transport-api"
});

transportApi.interceptors.request.use(config => {

    const storedUser =
        localStorage.getItem("currentUser");

    if (storedUser) {

        config.headers["x-user-data"] =
            storedUser;

    }

    return config;

});

export default transportApi;