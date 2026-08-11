import { useContext } from "react";
import UserContext from "../context/UserContext";

export default function useCurrentUser() {

    return useContext(UserContext);

}