import { Header } from "../../components";
import { Outlet } from "react-router-dom";

export default function OrderComponent() {
  return (
    <>
      <Header headerTitle="Commandes 📋"></Header>
      <Outlet />
    </>
  );
}
