import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoAddCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { api } from "../api";
import { useNotification } from "../hooks";
import { MedicineFromProvider } from "../models";

type ItemProps = {
  medicineName: string;
  quantity: number;
};

type Props = {
  orderId?: string;
  providerName: string;
  existingOrders: string[];
  onClose: () => void;
  onValidate?: (props: ItemProps) => void;
};

const StyledBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  backdrop-filter: blur(1px);
`;

const StyledContainer = styled.div`
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  width: 100%;
  max-width: 540px;
  transform: translate(-50%, -50%);
  background: white;
  box-shadow: 0 1px 10px #00000052;
  border-radius: 5px;
  padding-bottom: 1rem;

  button {
    all: unset;
    padding: 0.5rem 0;
    width: 100px;
    text-align: center;
    cursor: pointer;
    border-radius: 5px;
    outline: 1px solid transparent;
    transition: outline 250ms;
  }

  h1 {
    font-size: 1.5rem;
    margin: unset;
    border-bottom: 1px solid #0000002c;
    padding: 1rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  & > * {
    padding: 0 2rem;
  }

  form > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 1rem;
    gap: 2rem;

    select {
      flex-grow: 1;
      padding: 5px 10px;
      max-width: 80%;
    }

    input,
    select {
      border: 1px solid ${({ theme }) => theme.colors.primary};
      font-size: 1rem;
      height: 2rem;
      border-radius: 3px;
    }
  }

  .cancel-btn {
    background: red;
    color: white;

    &:hover {
      outline: 2px solid #ff8f8f;
    }
  }

  .validate-btn {
    background: ${({ theme }) => theme.colors.primary};

    &:hover {
      outline: 2px solid #ff8f8f;
    }
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
    gap: 1rem;
  }

  .prices {
    display: block;
    margin-top: 2rem;

    p {
      display: flex;
      justify-content: space-between;

      span:first-child {
        font-weight: bold;
      }
    }
  }

  .provider-name {
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.tertiary};
  }
`;

export default function AddMedicineToPurchaseOrder({
  orderId,
  onClose,
  providerName,
  existingOrders,
  onValidate,
}: Props) {
  const container = document.querySelector("#portal");
  if (!container) {
    return null;
  }

  const navigate = useNavigate();
  const { pushNotification } = useNotification();
  const [medicines, setMedicines] = useState<MedicineFromProvider[]>([]);
  const [medicine, setMedicine] = useState({
    index: 0,
    quantity: 1,
    name: "",
  });

  useEffect(() => {
    api
      .get(`/provider/medicines?providerName=${providerName}`)
      .then((res) => {
        const medicines: MedicineFromProvider[] = res.data.filter(
          (medicine) => !existingOrders.includes(medicine.name)
        );
        if (medicines.length > 0) {
          setMedicines(medicines);
        } else {
          pushNotification(
            `Tous les médicaments de ${providerName} sont listés dans le bon de commande`
          );
          onClose();
        }
      })
      .catch((err) => {
        console.error(err);
        onClose();
        pushNotification(
          `Impossible de charger la liste des médicaments pour ${providerName}`,
          "error"
        );
      });
  }, []);

  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (medicines && medicines.length > 0) {
      selectRef.current.value = medicines[0].name;
    }
  }, [medicines]);

  const formOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // fail safe
    if (!orderId) return;

    const medicineName = medicines[medicine.index].name;
    api
      .post(`/order/${orderId}/medicine`, {
        medicineFromProviderId: medicines[medicine.index].id,
        quantity: medicine.quantity,
      })
      .then(() => {
        pushNotification(
          `${medicineName} ajouté au bon de commande pour ${providerName}`
        );
        navigate(`/order/${orderId}`);
      })
      .catch(() => {
        pushNotification("Une erreur s'est produite", "error");
      })
      .finally(onClose);
  };

  return createPortal(
    <>
      <StyledBackground onClick={onClose} />
      <StyledContainer>
        <h1>
          <IoAddCircleOutline />
          <span>Ajouter médicament</span>
        </h1>
        <p className="provider-name">{providerName}</p>
        {medicines.length > 0 && (
          <form
            onSubmit={
              !onValidate
                ? formOnSubmit
                : (e) => {
                    e.preventDefault();
                    onValidate({
                      medicineName: selectRef.current.value,
                      quantity: medicine.quantity,
                    });
                  }
            }
          >
            <div>
              <label htmlFor="medicine">Désignation</label>
              <select
                ref={selectRef}
                name="medicine"
                id="medicine"
                defaultValue={medicine.name}
                onChange={(e) => {
                  const designation = e.currentTarget.value;
                  console.log(designation);
                  setMedicine((medicine) => ({
                    index: medicines.findIndex(
                      (medicine) => medicine.name == designation
                    ),
                    quantity: medicine.quantity,
                    name: designation,
                  }));
                }}
              >
                {medicines.map((medicine, i) => (
                  <option key={i} value={medicine.name}>
                    {medicine.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="quantity">Quantité</label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                min={1}
                max={medicines[medicine.index].quantity}
                defaultValue={1}
                onChange={(e) => {
                  if (medicines.length == 0) {
                    e.currentTarget.value = "1";
                    return;
                  }

                  const quantity = parseInt(e.currentTarget.value);
                  setMedicine((medicine) => ({
                    index: medicine.index,
                    quantity: isNaN(quantity) ? 0 : quantity,
                    name: medicine.name,
                  }));
                }}
              />
            </div>
            <div className="prices">
              <p>
                <span>Prix TTC</span>
                <span>
                  {medicine.quantity * medicines[medicine.index].priceWithTax}{" "}
                  Ar
                </span>
              </p>
              <p>
                <span>Prix HT</span>
                <span>
                  {medicine.quantity *
                    medicines[medicine.index].priceWithoutTax}{" "}
                  Ar
                </span>
              </p>
            </div>
            <div className="buttons">
              <button type="button" onClick={onClose} className="cancel-btn">
                Annuler
              </button>
              <button className="validate-btn">Ajouter</button>
            </div>
          </form>
        )}
      </StyledContainer>
    </>,
    container
  );
}
