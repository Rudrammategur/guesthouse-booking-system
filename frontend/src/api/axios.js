import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "/guesthouse-api"
});

api.interceptors.request.use(config => {

    console.log("Interceptor User:", window.currentUser);

    if (window.currentUser) {

        config.headers["x-user-data"] =
            JSON.stringify(window.currentUser);

    }

    return config;

});

export default api;