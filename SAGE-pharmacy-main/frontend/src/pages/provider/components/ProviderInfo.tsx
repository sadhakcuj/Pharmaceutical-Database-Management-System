import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../../api";
import { appear } from "../../../components/UpdateForm";
import { ProviderDto } from "../../../models";
import { IoMdClose } from "react-icons/io";

const StyledModal = styled.div`
  transition: all 500ms;
  animation: ${appear} both 100ms;

  .background {
    position: absolute;
    right: 0;
    bottom: 0;
    top: 0;
    left: 0;
    backdrop-filter: blur(2px);
    z-index: 4;
  }

  .modal {
    position: absolute;
    top: 52%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: ${({ theme }) => theme.colors.modalBackground};
    height: 80vh;
    width: 700px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    box-shadow: 0 0 5px #808080b8;
    overflow-y: auto;
    z-index: 5;
    box-shadow: 0 0 15px grey;

    .content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;

      & > svg {
        position: absolute;
        right: 0;
        font-size: 2rem;
        z-index: 2;
        cursor: pointer;
        margin: 0.25rem;
      }

      h1 {
        font-size: 1.25rem;
        padding: 1rem 0;
        border-bottom: solid 2px black;
        display: flex;
        justify-content: center;
        gap: 1rem;
        position: sticky;
        top: 0;
        background-color: ${({ theme }) => theme.colors.modalBackground};
      }

      p {
        margin: 0;
        padding: 0 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;

        span:last-of-type {
          max-width: 25rem;
        }
      }
    }

    .buttons {
      width: 100%;
      padding-right: 3rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
  }
`;

function ProviderInfo({ onClose }: { onClose: () => void }) {
  const [provider, setProvider] = useState<ProviderDto>(null);
  const { id: providerId } = useParams();

  useEffect(() => {
    api
      .get("/provider/" + providerId)
      .then((res) => setProvider(res.data))
      .catch((err) => console.error(err));
  }, []);

  return createPortal(
    <StyledModal>
      <div className="background" onClick={onClose}></div>
      <div className="modal">
        <div className="content">
          <IoMdClose onClick={onClose} />
          <h1>
            🍃<span>{provider?.name}</span>
          </h1>
          <p>
            <span>N* de compte: </span>
            <span>{provider?.accountNumber}</span>
          </p>
          <p>
            <span>Abrogé: </span>
            <span>{provider?.abridgment}</span>
          </p>
          <p>
            <span>N* de compte collectif: </span>
            <span>{provider?.commonAccountNumber}</span>
          </p>
          <p>
            <span>Adresse: </span>
            <span>{provider?.address}</span>
          </p>
          <p>
            <span>Adresse complémentaire: </span>
            <span>
              {provider?.complementAdress ? provider?.complementAdress : "N/A"}
            </span>
          </p>
          <p>
            <span>Code Postal: </span>
            <span>{provider?.postalCode ? provider?.postalCode : "N/A"}</span>
          </p>
          <p>
            <span>Ville: </span>
            <span>{provider?.city}</span>
          </p>
          <p>
            <span>Pays: </span>
            <span>{provider?.country}</span>
          </p>
          <p>
            <span>Telephone: </span>
            <span>{provider?.telephone}</span>
          </p>
          <p>
            <span>Telecopie: </span>
            <span>{provider?.telecopie ? provider?.telecopie : "N/A"}</span>
          </p>
          <p>
            <span>Email: </span>
            <span>{provider?.email ? provider?.email : "N/A"}</span>
          </p>
          <p>
            <span>Nom de contact: </span>
            <span>{provider?.contactName ? provider?.contactName : "N/A"}</span>
          </p>
          <p>
            <span>RC: </span>
            <span>{provider?.rc ? provider?.rc : "N/A"}</span>
          </p>
          <p>
            <span>STAT: </span>
            <span>{provider?.stat ? provider?.stat : "N/A"}</span>
          </p>
          <p>
            <span>NIF: </span>
            <span>{provider?.nif ? provider?.nif : "N/A"}</span>
          </p>
          <p>
            <span>CIF: </span>
            <span>{provider?.cif ? provider?.cif : "N/A"}</span>
          </p>
          <p>
            <span>Collecteur: </span>
            <span>{provider?.collector}</span>
          </p>
          <p>
            <span>Achat mininmum: </span>
            <span>{provider?.min} Ar.</span>
          </p>
        </div>
      </div>
    </StyledModal>,
    document.querySelector("#portal")!
  );
}

export default ProviderInfo;
