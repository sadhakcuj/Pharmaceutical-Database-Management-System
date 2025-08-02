import { lighten } from "polished";
import styled from "styled-components";
import { Order } from "../types";
import { useLoaderData, useNavigate } from "react-router-dom";
import { api } from "../../../api";
import { RiDeleteBin5Line } from "react-icons/ri";
import React, { useEffect, useState } from "react";
import { useNotification } from "../../../hooks";
import {
  AddMedicineToPurchaseOrder,
  ConfirmationDialog,
} from "../../../components";

export async function loader({ params }) {
  const res = await api.get(`/order/${params.id}`);
  return res.data;
}

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 2rem;

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

export default function EditOrder() {
  const order = useLoaderData() as Order;
  const navigate = useNavigate();
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const { pushNotification } = useNotification();
  const [rows, setRows] = useState<
    {
      medicineName: string;
      quantity: number;
      maxQuantity: number;
      priceWithTax: number;
      priceWithoutTax: number;
    }[]
  >([]);

  useEffect(() => {
    setRows(
      order.orderMedicines
        .sort((a, b) => (a.name < b.name ? -1 : 1))
        .map((medicine) => ({
          medicineName: medicine.name,
          priceWithoutTax: medicine.priceWithoutTax,
          priceWithTax: medicine.priceWithTax,
          quantity: medicine.quantityToOrder,
          maxQuantity: medicine.quantity,
        }))
    );
  }, [order]);

  const onValidate = () => {
    if (rows.length > 0) {
      api
        .patch(`/order/${order.id}/medicine`, {
          datas: rows.map((row) => ({
            name: row.medicineName,
            quantity: row.quantity,
          })),
        })
        .then(() => {
          navigate("/order");
          pushNotification(
            `Bon de commande pour ${order.providerName} mis à jour`
          );
        })
        .catch((err) => {
          console.error(err);
          pushNotification("Une erreur s'est produite", "error");
        });
    } else {
      setShowValidation(true);
    }
  };

  const removeMedicineOrder = (medicineName: string) => {
    api
      .post(`/order/${order.id}`, { medicineName })
      .then(() => {
        pushNotification(`${medicineName} supprimé du bon de commande`);
        setRows((rows) =>
          rows.filter((row) => row.medicineName != medicineName)
        );
      })
      .catch((err) => {
        console.error(err);
        pushNotification("Une erreur s'est produite", "error");
      });
  };

  return (
    <>
      <StyledContainer>
        <header>
          <h1>🍃 {order.providerName}</h1>
          <div className="buttons">
            <button onClick={() => setShowAddMedicineModal(true)}>
              Ajouter
            </button>
            <button onClick={onValidate}>Valider</button>
          </div>
        </header>
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
                  <button onClick={() => removeMedicineOrder(row.medicineName)}>
                    <RiDeleteBin5Line />
                  </button>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
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
          {order.minPurchase ? (
            <p>
              <span>Achat minimum</span>
              <span>{order.minPurchase}Ar.</span>
            </p>
          ) : (
            <p>
              <span>Quantité minimum</span>
              <span>{order.minQuantity} pcs.</span>
            </p>
          )}
        </div>
      </StyledContainer>
      {showAddMedicineModal && (
        <AddMedicineToPurchaseOrder
          onClose={() => setShowAddMedicineModal(false)}
          orderId={order.id}
          providerName={order.providerName}
          existingOrders={rows.map((row) => row.medicineName)}
        />
      )}
      {showValidation && (
        <ConfirmationDialog
          action={() => {
            api.delete(`/order/${order.id}`).finally(() => {
              navigate("/order");
              pushNotification(
                `Bon de commande pour ${order.providerName} mis à jour`
              );
            });
          }}
          cancel={{
            buttonColor: "red",
            text: "Annuler",
          }}
          confirm={{
            buttonColor: "green",
            text: "Valider",
          }}
          message={`Ce bon de commande ne contient aucun médicament. Ne rien commander à ${order.providerName} ?`}
          onClose={() => {
            setShowValidation(false);
          }}
          title="Bon de commande vide"
        />
      )}
    </>
  );
}
