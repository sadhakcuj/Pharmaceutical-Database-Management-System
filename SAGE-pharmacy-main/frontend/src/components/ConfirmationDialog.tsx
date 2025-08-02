import styled from "styled-components";
import { darken, lighten } from "polished";
import { createPortal } from "react-dom";

export type Content = {
  text: string;
  buttonColor: string;
};

const StyledButton = styled.button<{ $color: string }>`
  border: none;
  padding: 0.75rem 0;
  width: 100px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: color 250ms, background-color 250ms;
  background-color: ${({ $color }) => $color};
  outline: solid 3px ${({ $color }) => darken(0.25, $color)};
  color: white;

  &:hover {
    background-color: ${({ $color }) => lighten(0.1, $color)};
    outline: solid 3px ${({ $color }) => $color};
    color: white;
  }
`;

const StyledBackground = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  backdrop-filter: blur(2px);
  z-index: 2;
`;

const StyledModal = styled.div`
  z-index: 3;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${({ theme }) => theme.colors.modalBackground};
  height: ${({ theme }) => theme.sizes.modalHeight};
  width: ${({ theme }) => theme.sizes.modalWidth};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 0 5px #808080b8;

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;

    h1 {
      text-align: center;
      font-size: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: solid 2px black;
    }

    p {
      text-align: justify;
      font-size: 1rem;
      margin: 0;
      padding: 0 2rem;
    }
  }

  .buttons {
    width: 100%;
    padding-right: 3rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
`;

const ConfirmationDialog = ({
  title,
  message,
  confirm,
  cancel,
  onClose,
  onCancel,
  action,
}: {
  title: string;
  message: string;
  confirm: Content;
  cancel: Content;
  onCancel?: () => void;
  onClose: () => void;
  action: () => void;
}) => {
  return createPortal(
    <>
      <StyledBackground onClick={onClose} />
      <StyledModal>
        <div className="content">
          <h1>{title}</h1>
          <p>{message}</p>
        </div>
        <div className="buttons">
          <StyledButton
            $color={cancel.buttonColor}
            onClick={onCancel ? onCancel : onClose}
          >
            {cancel.text}
          </StyledButton>
          <StyledButton $color={confirm.buttonColor} onClick={action}>
            {confirm.text}
          </StyledButton>
        </div>
      </StyledModal>
    </>,
    document.querySelector("#portal")!
  );
};

export default ConfirmationDialog;
