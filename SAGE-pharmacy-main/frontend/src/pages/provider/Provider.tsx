import { lighten } from "polished";
import { useRef, useState } from "react";
import { FaFileCirclePlus } from "react-icons/fa6";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../api";
import { ConfirmationDialog, Header } from "../../components";
import { useNotification } from "../../hooks";
import { Order } from "../order/types";

const StyledContainer = styled.div`
  padding: 0 2rem;
`;

const StyledHeader = styled(Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .import {
    display: flex;
    align-items: center;
    gap: 1rem;

    .import-btn {
      all: unset;
      font-size: 2rem;
      cursor: pointer;

      svg {
        fill: ${({ theme }) => theme.colors.buttons.add};
      }

      &:hover {
        background: transparent;
      }
    }

    button {
      margin-right: 2rem;
      height: 3rem;
      padding: 5px 25px;
      background-color: ${({ theme }) => theme.colors.buttons.add};
      color: white;
      font-weight: 600;
      border: none;
      border-radius: 5px;
      cursor: pointer;

      &:hover {
        background-color: ${({ theme }) =>
          lighten(0.1, theme.colors.buttons.add)};
      }

      &.disabled {
        cursor: not-allowed;
        background-color: #80808081;

        &:hover {
          background-color: #80808081;
        }
      }
    }

    input {
      display: none;
    }
  }
`;

export default function Provider() {
  const location = useLocation();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [formData, setFormData] = useState<FormData>();

  const { pushNotification } = useNotification();

  const navigate = useNavigate();
  const { id: providerId } = useParams();

  const triggerFileInput = (_e: React.MouseEvent<HTMLButtonElement>) => {
    const fileInput = document.querySelector("#xlsx-file") as HTMLInputElement;
    fileInput.click();
    formRef.current.cli;
  };

  const enableButton = () => {
    setFileLoaded(true);
    const button = formRef.current.querySelector("button") as HTMLElement;
    button.classList.remove("disabled");
  };

  const prepareSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const orders: Order[] = (await api.get("/order/provider/" + providerId))
      .data;
    if (orders.length > 0) {
      setShowConfirmationDialog(true);
      setFormData(formData);
    }
  };

  const importProviderXlsx = () => {
    const path = location.pathname.split("/");
    api
      .post("/provider/import/" + path[path.length - 1], formData)
      .then(() => {
        pushNotification("Importation terminé");
        setTimeout(() => navigate(0), 750);
      })
      .catch((err) => {
        console.log(err);
        pushNotification("Erreur lors de l'importation", "error");
        setTimeout(() => navigate(0), 750);
      });
  };

  return (
    <>
      <StyledHeader headerTitle="Fournisseurs 🏭">
        <form ref={formRef} onSubmit={prepareSubmit}>
          {location.pathname.includes("create") ? null : (
            <div className="import">
              <button
                type="button"
                className="import-btn"
                title="importer liste pour fournisseur"
                onClick={triggerFileInput}
              >
                <FaFileCirclePlus />
              </button>
              <input
                ref={inputRef}
                type="file"
                name="xlsx-file"
                id="xlsx-file"
                accept=".xlsx"
                onChange={enableButton}
              />
              <button
                disabled={!fileLoaded}
                className="disabled"
                title={!fileLoaded ? "Sélectionner un fichier d'abord" : ""}
              >
                Importer
              </button>
            </div>
          )}
        </form>
      </StyledHeader>
      <StyledContainer>
        <Outlet />
      </StyledContainer>
      {showConfirmationDialog ? (
        <ConfirmationDialog
          title={"Bon de commande encore en cours"}
          message={
            "Il y a encore des bons en cours de traitement. Importer des médicaments pour le fournisseur actuel effacera tous les bon de commandes associés au fournisseur actuelle. Voulez vous continuer?"
          }
          cancel={{
            text: "Annuler",
            buttonColor: "green",
          }}
          confirm={{
            text: "Importer",
            buttonColor: "#0084ff",
          }}
          onClose={() => setShowConfirmationDialog(false)}
          action={importProviderXlsx}
        />
      ) : null}
    </>
  );
}
