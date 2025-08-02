import { lighten } from "polished";
import React, { useEffect, useState } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../../api";
import {
  AddMedicineToPurchaseOrder,
  ConfirmationDialog,
} from "../../../components";
import { useNotification } from "../../../hooks";
import { Provider } from "../../../models";

const StyledCreateOrder = styled.form`
  margin-left: 2rem;
  display: flex;
  flex-direction: column;

  h2 {
    font-size: 2rem;
  }

  .selection {
    display: flex;
    align-items: center;
    gap: 2rem;

    label {
      font-size: 1rem;
      font-weight: bold;
    }

    select {
      height: 2rem;
    }
  }
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 2rem;

  .no-item {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  input {
    width: 64px;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      color: green;
      font-size: 1.5rem;
    }

    .buttons {
      display: flex;
      gap: 1rem;

      button {
        height: 2rem;
        padding: 5px 20px;
        border: none;
        color: white;
        font-weight: 600;
        border-radius: 3px;
        cursor: pointer;

        &:first-of-type {
          background-color: ${({ theme }) => theme.colors.buttons.edit};

          &:hover {
            background-color: ${({ theme }) =>
              lighten(0.1, theme.colors.buttons.edit)};
          }
        }

        &:last-of-type {
          background-color: ${({ theme }) => theme.colors.buttons.add};

          &:hover {
            background-color: ${({ theme }) =>
              lighten(0.1, theme.colors.buttons.add)};
          }
        }
      }
    }
  }

  .table {
    &-container {
      max-height: 50vh;
      overflow-y: auto;
    }

    display: grid;
    grid-template-columns: 1fr repeat(3, 0.5fr) 64px;

    div {
      padding: 5px;
      border: 1px solid #00000014;
      text-align: center;
      display: grid;
      place-items: center;
    }

    button {
      all: unset;
      background: red;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
      outline: 2px solid transparent;
      transition: outline 500ms;

      svg {
        fill: white;
      }

      &:hover {
        outline: 2px solid #ff8282;
      }
    }

    .odd {
      background-color: ${({ theme }) => lighten(0.2, theme.colors.primary)};
    }

    .even {
      background-color: ${({ theme }) => lighten(0.25, theme.colors.primary)};
    }

    .blank {
      background: white;
      position: sticky;
      top: 0;
    }

    .heading {
      position: sticky;
      top: 0;
      color: white;
      font-weight: bold;
      padding: 10px 0;

      &:nth-of-type(odd) {
        background-color: ${({ theme }) => theme.colors.tertiary};
      }

      &:nth-of-type(even) {
        background-color: ${({ theme }) => lighten(0.1, theme.colors.tertiary)};
      }
    }
  }

  .prices {
    margin: 0;
    padding-right: 2rem;

    p {
      max-width: 280px;
      margin-left: auto;
      display: flex;
      justify-content: space-between;
    }

    span {
      &:last-of-type {
        margin-left: 1rem;
        font-weight: 700;
      }
    }
  }
`;

function CreateOrder() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [rows, setRows] = useState<
    {
      medicineName: string;
      quantity: number;
      maxQuantity: number;
      priceWithTax: number;
      priceWithoutTax: number;
    }[]
  >([]);
  const { pushNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/provider").then((res) => setProviders(res.data));
  }, []);

  useEffect(() => {
    if (providers && providers.length > 0) {
      setCurrentProvider(providers[0]);
    }
  }, [providers]);

  const updateCurrentProvider = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentProvider(providers[e.currentTarget.value]);
  };

  const updateNewOrderMedicines = ({
    medicineName,
    quantity,
  }: {
    medicineName: string;
    quantity: number;
  }) => {
    let maxQuantity = 0;
    let priceWithoutTax = 0;
    let priceWithTax = 0;

    currentProvider.medicines.forEach((medicine) => {
      if (medicine.name == medicineName) {
        maxQuantity = medicine.quantity;
        priceWithTax = medicine.priceWithTax;
        priceWithoutTax = medicine.priceWithoutTax;
      }
    });

    const obj = {
      maxQuantity,
      medicineName,
      priceWithoutTax,
      priceWithTax,
      quantity,
    };

    setRows([...rows, obj]);

    setShowAddMedicineModal(false);
  };

  const createNewOrder = () => {
    api
      .post("/order", {
        orders: rows.map((row) => ({
          medicine: {
            name: row.medicineName,
            owner: currentProvider.id,
          },
          quantityToOrder: row.quantity,
        })),
      })
      .then(() => pushNotification("Bon de commande créé avec succès"))
      .catch((err) => {
        console.error(err);
        if (err.response.status == 409) {
          pushNotification("Commande déjà existante", "error");
        } else {
          pushNotification(
            "Erreur lors de la création du bon de commande",
            "error"
          );
        }
      })
      .finally(() => navigate("/order"));
  };

  return (
    <>
      <StyledCreateOrder>
        <h2>Nouvelle commande</h2>
        <div className="selection">
          <label htmlFor="provider-name">Sélectionner un fournisseur</label>
          <select
            name="provider-name"
            id="provider-name"
            onChange={updateCurrentProvider}>
            {providers.map((provider, i) => (
              <option key={i} value={i}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
      </StyledCreateOrder>
      <StyledContainer>
        <header>
          <h1>{currentProvider && currentProvider.name}</h1>
          <div className="buttons">
            <button onClick={() => setShowAddMedicineModal(true)}>
              Ajouter
            </button>
            <button
              onClick={() => {
                if (rows.length > 0) setShowValidation(true);
                else pushNotification("Bon de commande vide", "error");
              }}>
              Valider
            </button>
          </div>
        </header>
        {rows.length == 0 ? (
          <h1 className="no-item">Aucun médicament à lister</h1>
        ) : (
          <div className="table-container">
            <div className="table">
              <div className="heading">Nom</div>
              <div className="heading">Quantité</div>
              <div className="heading">Prix HT</div>
              <div className="heading">Prix TTC</div>
              <div className="blank"></div>
              {rows.map((row, i) => (
                <React.Fragment key={i}>
                  <div className={i % 2 ? "odd" : "even"}>
                    <span>{row.medicineName}</span>
                  </div>
                  <div className={i % 2 ? "odd" : "even"}>
                    <input
                      type="number"
                      min={1}
                      max={row.maxQuantity}
                      value={row.quantity}
                      onChange={(e) => {
                        let value = parseInt(e.currentTarget.value);
                        if (value > row.maxQuantity) value = row.maxQuantity;
                        else if (value <= 0) value = 1;
                        setRows((rows) => {
                          const row = rows[i];
                          row.quantity = value;
                          return [...rows];
                        });
                      }}
                    />
                  </div>
                  <div className={i % 2 ? "odd" : "even"}>
                    <span>{row.quantity * row.priceWithTax}</span>
                  </div>
                  <div className={i % 2 ? "odd" : "even"}>
                    <span>{row.quantity * row.priceWithoutTax}</span>
                  </div>
                  <div className={i % 2 ? "odd" : "even"}>
                    <button onClick={() => {}}>
                      <RiDeleteBin5Line />
                    </button>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        <div className="prices">
          <p>
            <span>Prix Total HT</span>{" "}
            <span>
              {(function () {
                let total = 0;
                rows.forEach((row) => {
                  total += row.priceWithTax * row.quantity;
                });
                return total;
              })()}
              Ar.
            </span>
          </p>
          <p>
            <span>Prix Total TTC</span>{" "}
            <span>
              {(function () {
                let total = 0;
                rows.forEach((row) => {
                  total += row.priceWithoutTax * row.quantity;
                });
                return total;
              })()}
              Ar.
            </span>
          </p>
          <p>
            <span>Achat minimum</span>
            <span>{currentProvider && currentProvider.min}Ar.</span>
          </p>
        </div>
      </StyledContainer>
      {currentProvider && showAddMedicineModal && (
        <AddMedicineToPurchaseOrder
          onClose={() => setShowAddMedicineModal(false)}
          providerName={currentProvider.name}
          existingOrders={rows.map((row) => row.medicineName)}
          onValidate={updateNewOrderMedicines}
        />
      )}
      {showValidation && (
        <ConfirmationDialog
          action={createNewOrder}
          cancel={{
            buttonColor: "red",
            text: "Annuler",
          }}
          confirm={{
            buttonColor: "green",
            text: "Valider",
          }}
          message={`Créer un bon de commande contenat les médicament de la liste à ${currentProvider.name} ?`}
          onClose={() => {
            setShowValidation(false);
          }}
          title="Bon de commande vide"
        />
      )}
    </>
  );
}

export default CreateOrder;
