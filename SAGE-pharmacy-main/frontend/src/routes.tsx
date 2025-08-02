import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Login, Order, Provider, Purchase, Stock } from "./pages";
import Archive from "./pages/archive/Archive";
import {
  CreateOrder,
  EditOrder,
  ErrorOnOrderCreate,
  OrderList,
} from "./pages/order/components";
import { loader as orderLoader } from "./pages/order/components/EditOrder";
import {
  CreateProvider,
  ProviderList,
  ProviderMedicines,
  ProviderNotFound,
} from "./pages/provider/components";
import EditProvider from "./pages/provider/components/EditProvider";
import NotFound from "./pages/provider/components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "stock",
        element: <Stock />,
      },
      {
        path: "purchase",
        element: <Purchase />,
      },
      {
        path: "order",
        element: <Order />,
        children: [
          {
            path: "",
            element: <OrderList />,
          },
          {
            path: ":id",
            loader: orderLoader,
            element: <EditOrder />,
          },
          {
            path: "create",
            element: <CreateOrder />,
            errorElement: <ErrorOnOrderCreate />,
          },
        ],
      },
      {
        path: "provider",
        element: <Provider />,
        children: [
          {
            path: "",
            element: <ProviderList />,
          },
          {
            path: ":id",
            element: <ProviderMedicines />,
            errorElement: <ProviderNotFound />,
          },
          {
            path: "create",
            element: <CreateProvider />,
            errorElement: <ProviderNotFound />,
          },
          {
            path: "edit/:id",
            element: <EditProvider />,
            errorElement: <NotFound />,
          },
        ],
      },
      {
        path: "archive",
        element: <Archive />,
        errorElement: <NotFound />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);
