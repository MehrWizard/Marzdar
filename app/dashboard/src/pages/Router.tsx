import { createHashRouter } from "react-router-dom";
import { queryClient } from "../utils/react-query";
import { CurrentAdminUserQueryKey, fetchUser } from "../hooks/useGetUser";
import { Dashboard } from "./Dashboard";
import { Login } from "./Login";

const fetchAdminLoader = () => {
    return queryClient.fetchQuery(CurrentAdminUserQueryKey, fetchUser);
};
export const router = createHashRouter([
    {
        path: "/",
        element: <Dashboard />,
        errorElement: <Login />,
        loader: fetchAdminLoader,
    },
    {
        path: "/login/",
        element: <Login />,
    },
]);