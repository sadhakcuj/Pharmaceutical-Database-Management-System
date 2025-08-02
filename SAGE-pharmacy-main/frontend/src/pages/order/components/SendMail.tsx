import { darken, lighten } from "polished";
import { useState } from "react";
import { createPortal } from "react-dom";
import { FcAcceptDatabase } from "react-icons/fc";
import { CgSpinnerAlt } from "react-icons/cg";
import { MdClose, MdDownload } from "react-icons/md";
import styled, { keyframes } from "styled-components";
import { api } from "../../../api";
import { useNotification } from "../../../hooks";
import { Order } from "../types";

type Props = {
  onClose: () => void;
  onValidate: () => void;
  order: Order & {
    providerEmail: string;
  };
};

const rotate = keyframes`
from {
  transform: rotate(0deg);
} to {
  transform: rotate(360deg);
}
`;

const StyledBackground = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  backdrop-filter: blur(1px);
  z-index: 2;
`;

const StyledModal = styled.form`
  z-index: 3;
  width: 100%;
  max-width: 640px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 5px 15px #0000004d;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  button {
    all: unset;
    cursor: pointer;
  }

  main {
    padding: 0 1rem 1rem;
  }

  p {
    margin: 0.5rem 0;

    span:first-of-type {
      font-weight: bold;
      margin-right: 1rem;
    }
  }

  .subject {
    display: flex;
    gap: 1rem;

    label {
      font-weight: bold;
    }

    input {
      border: 1px solid black;
      border-radius: 3px;
      padding: 5px;
      font-size: 0.8rem;
      flex-grow: 1;
    }
  }

  .info {
    font-size: 0.75rem;
    color: darkgrey;

    .download-btn {
      background: ${({ theme }) => theme.colors.secondary};
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translate(-50%, -0.5rem) scaleY(0);
      transform-origin: bottom;
      transition: transform 250ms;
      display: flex;
      align-items: center;
      font-size: 1rem;
      padding: 0.5rem 0.75rem;
      gap: 0.5rem;
      cursor: pointer;
      color: black;

      &:after {
        display: block;
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-left: 0.5rem solid transparent;
        border-right: 0.5rem solid transparent;
        border-top: 0.75rem solid ${({ theme }) => theme.colors.secondary};
      }

      * {
        cursor: inherit;
      }
    }

    span {
      margin-right: 0 !important;
      color: inherit;
      transition: color 500ms;
      cursor: default;
      position: relative;

      &:hover {
        color: black;

        & > button {
          transform: translate(-50%, -0.5rem) scaleY(1);
        }
      }
    }
  }

  h1 {
    font-size: 1.5rem;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: ${({ theme }) => lighten(0.2, theme.colors.primary)};
    margin: 0 0 1rem;

    span {
      color: #000000b7;
    }

    button {
      width: 2.25rem;
      height: 2.25rem;
      display: grid;
      place-items: center;
      border-radius: 2rem;
      background: transparent;
      transition: background 300ms;

      svg {
        fill: red;
      }

      &:hover {
        background: #00000015;
      }
    }

    div {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  .button {
    display: flex;
    justify-content: flex-end;
    padding-right: 0.5rem;

    button {
      background: ${({ theme }) => theme.colors.secondary};
      transition: background 250ms;
      color: #efefef;
      padding: 0.5rem 1.25rem;
      border-radius: 5px;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      span {
        color: #efefef;

        path {
          color: #efefef;
        }

        svg {
          font-size: 1.125rem;
          animation: ${rotate} ease-out 750ms infinite;
        }
      }

      &:hover {
        color: white;
        background: ${({ theme }) => darken(0.25, theme.colors.secondary)};
      }
    }
  }

  .textarea {
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
    gap: 1rem;

    textarea {
      border: 1px solid black;
      resize: none;
    }
  }
`;

export default function SendMail({ order, onValidate, onClose }: Props) {
  const { pushNotification } = useNotification();
  const [pending, setPending] = useState(false);

  const container = document.querySelector("#portal");
  if (!container) {
    return null;
  }

  const formOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const mail: string = form.mail.value;
    const subject: string = form.subject.value;

    setPending(true);
    api
      .post(`/mail/order`, {
        mail,
        subject,
        providerName: order.providerName,
      })
      .then(() => {
        onValidate();
        pushNotification(`Mail envoyé à ${order.providerName}`);
        onClose();
      })
      .catch((err) => {
        console.error(err);
        pushNotification("Impossible d'envoyer le mail", "error");
      })
      .finally(() => setPending(false));
  };

  const downloadButtonOnClick = () => {
    api
      .get(`/order/bill?providerName=${order.providerName}`, {
        responseType: "blob",
      })
      .then((res) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(res.data);

        const now = new Date();
        a.download = `${order.providerName}_${now.toISOString()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((e) => {
        console.error(e);
        pushNotification("Une erreur s'est produite lors du téléchargement");
      });
  };

  return createPortal(
    <>
      <StyledBackground onClick={onClose} />
      <StyledModal onSubmit={formOnSubmit}>
        <h1>
          <div>
            <FcAcceptDatabase /> <span>Passer la commande</span>
          </div>
          <button onClick={onClose} type="button">
            <MdClose />
          </button>
        </h1>
        <main>
          <a className="edit" href={`/order/${order.id}`}></a>
          <p>
            <span>Fournisseur : </span>
            <span>
              {order.providerName} <i>{`<${order.providerEmail}>`}</i>
            </span>
          </p>
          <p>
            <span>Prix total TTC : </span>
            <span>{order.totalPriceWithTax} Ar</span>
          </p>
          <p>
            <span>Prix total HT : </span>
            <span>{order.totalPriceWithoutTax} Ar</span>
          </p>
          <div className="subject">
            <label htmlFor="subject">Objet : </label>
            <input type="text" name="subject" id="subject" />
          </div>
          <div className="textarea">
            <label htmlFor="mail">✏️ Ecrivez le contenu du mail</label>
            <textarea name="mail" id="mail" rows={15}></textarea>
          </div>
          <p className="info">
            *Une version pdf du{" "}
            <span>
              bon de commande{" "}
              <button
                className="download-btn"
                type="button"
                onClick={downloadButtonOnClick}
              >
                <span>Télécharger</span>
                <MdDownload />
              </button>
            </span>{" "}
            sera attaché en pièce-jointe
          </p>
          <div className="button">
            <button disabled={pending}>
              {pending ? (
                <>
                  <span>En cours d'envoi</span>
                  <span>
                    <CgSpinnerAlt />
                  </span>
                </>
              ) : (
                "Envoyer"
              )}
            </button>
          </div>
        </main>
      </StyledModal>
    </>,
    container
  );
}
