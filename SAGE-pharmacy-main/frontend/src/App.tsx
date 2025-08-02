import { Outlet } from "react-router-dom";
import { NotificationProvider } from "./contexts/provider";
import { Sidebar, ToastNotification } from "./components";
import styled from "styled-components";

if (import.meta.env.PROD) {
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.body.style.userSelect = "none";
}

const StyledContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 280px calc(100vw - 280px);

  .right {
    max-height: 100vh;
    overflow-y: auto;
  }
`;

function App() {
  return (
    <StyledContainer>
      <Sidebar />
      <div className="right">
        <NotificationProvider>
          <Outlet />
          <ToastNotification />
        </NotificationProvider>
      </div>
    </StyledContainer>
  );
}

export default App;
