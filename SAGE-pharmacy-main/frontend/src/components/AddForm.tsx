import { useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { api } from "../api";
import { MedicineDto } from "../models";
import { appear, errorAppear } from "./UpdateForm";

const StyledModal = styled.div`
  .background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    place-items: center;
    backdrop-filter: blur(1.5px);
    background-color: #ffffff2a;
  }

  form {
    background-color: white;
    width: 100%;
    min-width: 400px;
    max-width: 480px;
    height: 500px;
    border-radius: 5px;
    box-shadow: 0 0 5px grey;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: 500px;
    overflow-y: auto;
    padding-bottom: 0;
    animation: 500ms both ${appear};

    .inputs {
      padding: 1rem;

      & > div {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;

        label {
          font-weight: bolder;
        }

        input[type="text"],
        input[type="number"] {
          padding: 0.75rem;
        }

        input[type="date"] {
          padding: 0.75rem;
          cursor: pointer;

          &::-webkit-calendar-picker-indicator {
            cursor: pointer;
          }
        }
        input[type="date"]::-webkit-datetime-edit,
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-clear-button {
          color: #fff;
          position: relative;
        }

        input[type="date"]::-webkit-datetime-edit-year-field {
          position: absolute !important;
          border-left: 1px solid #8c8c8c;
          padding: 2px 5px;
          color: #000;
          left: 56px;
        }

        input[type="date"]::-webkit-datetime-edit-month-field {
          position: absolute !important;
          border-left: 1px solid #8c8c8c;
          padding: 2px 5px;
          color: #000;
          left: 26px;
        }

        input[type="date"]::-webkit-datetime-edit-day-field {
          position: absolute !important;
          color: #000;
          padding: 2px;
          left: 4px;
        }
      }

      .tax {
        display: flex;
        flex-direction: row;

        input[type="checkbox"] {
          padding: 0.75rem;
        }
      }
    }

    .buttons {
      user-select: none;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      position: sticky;
      bottom: 0;
      background: linear-gradient(to bottom, white, #dcd8d8ac);
      padding: 0.5rem 0 1rem;
      padding-right: 1rem;

      p {
        margin: 0 1rem;
        font-size: ${({ theme }) => theme.error.fontSize};
        color: ${({ theme }) => theme.colors.error};
        font-weight: 500;
        text-align: justify;
        animation: ${errorAppear} 500ms both;
      }

      button {
        all: unset;
        padding: 0.5rem 0.75rem;
        border-radius: 5px;
        color: white;
        cursor: pointer;
        width: 60px;
        text-align: center;
        transition: background-color 250ms;

        &:nth-of-type(1) {
          background-color: ${({ theme }) => theme.colors.cancelButton};

          &:hover {
            background-color: ${({ theme }) => theme.colors.cancelButtonLight};
          }
        }

        &:nth-of-type(2) {
          background-color: grey;

          &:hover {
            background-color: #8080808d;
          }
        }

        &:last-of-type {
          background-color: ${({ theme }) => theme.colors.acceptButton};

          &:hover {
            background-color: ${({ theme }) => theme.colors.acceptButtonLight};
          }
        }
      }
    }
  }
`;

const AddForm = ({ onClose }: { onClose: (submited: boolean) => void }) => {
  const [error, setError] = useState("");

  const addMedicine = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const medicineToUpdate: MedicineDto = {
      name: data.get("name")!.toString(),
      costPrice: parseFloat(data.get("cost-price")!.toString()),
      sellingPrice: parseFloat(data.get("selling-price")!.toString()),
      dci: data.get("dci")!.toString(),
      isTaxed: data.get("tax") ? true : false,
      location: data.get("location")!.toString(),
      min: parseInt(data.get("min")!.toString()),
      max: parseInt(data.get("max")!.toString()),
      quantity: parseInt(data.get("quantity")!.toString()),
      expirationDate:
        data.get("expiration")!.toString() == ""
          ? new Date().toISOString()
          : new Date(data.get("expiration")!.toString()).toISOString(),
    };

    api
      .post("/stock/medicine", {
        ...medicineToUpdate,
      })
      .then(() => onClose(true))
      .catch((e) => {
        if (e.response.status == 400) {
          setError(
            "Produit invalide ou nom déjà existant! Veuillez vérifier les champs."
          );
        } else if (e.response.status == 409) {
          setError("Deux médicaments ne peuvent avoir exactement le même nom.");
        }
      });
  };

  return createPortal(
    <StyledModal>
      <div className="background" onClick={() => onClose(false)}></div>
      <form onSubmit={addMedicine}>
        <div className="inputs">
          <div>
            <label htmlFor="name">Nom</label>
            <input required id="name" name="name" type="text" />
          </div>
          <div>
            <label htmlFor="cost-price">Prix d'achat</label>
            <input
              required
              id="cost-price"
              name="cost-price"
              type="number"
              min={100}
              onMouseLeave={(e) => {
                if (parseFloat(e.currentTarget.value) < 0)
                  e.currentTarget.value = "0";
              }}
            />
          </div>
          <div>
            <label htmlFor="selling-price">Prix de vente</label>
            <input
              required
              id="selling-price"
              name="selling-price"
              type="number"
              min={100}
            />
          </div>
          <div>
            <label htmlFor="quantity">Quantité</label>
            <input
              required
              id="quantity"
              name="quantity"
              type="number"
              min={1}
            />
          </div>
          <div>
            <label htmlFor="location">Emplacement</label>
            <input required id="location" name="location" type="text" />
          </div>
          <div>
            <label htmlFor="dci">DCI</label>
            <input required id="dci" name="dci" type="text" />
          </div>
          <div className="tax">
            <label htmlFor="tax">Taxé</label>
            <input id="tax" name="tax" type="checkbox" />
            <span>(Taxé si coché)</span>
          </div>
          <div>
            <label htmlFor="min">Stock Min</label>
            <input required id="min" name="min" type="number" min={1} />
          </div>
          <div>
            <label htmlFor="max">Stock Max</label>
            <input required id="max" name="max" type="number" min={1} />
          </div>
          <div>
            <label htmlFor="max">Expiration</label>
            <input required id="expiration" name="expiration" type="date" />
          </div>
        </div>
        <div className="buttons">
          {error.length > 0 ? <p>{error}</p> : null}
          <button type="button" onClick={() => onClose(false)}>
            Annuler
          </button>
          <button>Ajouter</button>
        </div>
      </form>
    </StyledModal>,
    document.querySelector("#portal")!
  );
};

export default AddForm;
