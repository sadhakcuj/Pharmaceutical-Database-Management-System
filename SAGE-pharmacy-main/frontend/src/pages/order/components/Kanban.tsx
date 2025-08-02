import { BsCheckLg } from "react-icons/bs";
import { GoMoveToEnd } from "react-icons/go";
import { MdEdit, MdPostAdd } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { KanbanItemStatus, KanbanItemStatusObject, Order } from "../types";
import { appear } from "../../../styles/animations";
import { isValid } from "./OrderList";
import { MdOutlineUploadFile } from "react-icons/md";
import { HiOutlineViewfinderCircle } from "react-icons/hi2";
import { api } from "../../../api";
import { useNotification } from "../../../hooks";
import { useEffect, useState } from "react";
import ReceiptsCaroussel from "./ReceiptsCaroussel";

type KanbanProps = {
  title: string;
  orders: Order[];
  moveItems?: () => void;
  moveItem?: (indexOfItemToMove: number) => void;
  deleteItem?: (indexOfItemToDelete: number) => void;
  onOrderSelect?: (order: Order) => void;
};

const StyledDiv = styled.div`
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;

    h1 {
      margin: 1rem 0;
      font-size: 18px;
    }

    .buttons {
      display: flex;
      gap: 1rem;
      align-items: baseline;

      button {
        all: unset;
        cursor: pointer;
      }

      .add {
        svg {
          fill: blue;
        }
        font-size: 1.75rem;
      }

      .move-all {
        svg {
          fill: green;
        }
        font-size: 1.5rem;
      }
    }
  }
`;

const StyledKanban = styled.div<{ $size: number }>`
  display: flex;
  flex-direction: column;
  background-color: white;
  height: 70vh;
  width: 300px;
  overflow-y: auto;
  border-radius: 5px;
  overflow-y: scroll;
  overflow-x: hidden;
  gap: 1rem;
  position: relative;
  padding-bottom: 1rem;

  &::-webkit-scrollbar-track {
    display: none;
  }

  &::-webkit-scrollbar-thumb {
    display: none;
  }

  h1 {
    font-size: 25px;
  }

  &:hover {
    overflow-y: scroll;
    &::-webkit-scrollbar-track {
      display: ${({ $size }) => ($size == 0 ? "none" : "block")};
    }

    &::-webkit-scrollbar-thumb {
      display: ${({ $size }) => ($size == 0 ? "none" : "block")};
    }
  }

  .buttons {
  }
`;

const StyledKanbanItemDiv = styled.div<{
  $isValid: boolean;
  $status: KanbanItemStatus;
}>`
  width: 95%;
  min-height: 150px;
  box-shadow: 0 1px 5px #8080807b;
  margin: 0 auto;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: white;
  cursor: pointer;
  transition: transform 250ms, box-shadow 250ms;
  position: relative;
  overflow: hidden;
  animation: ${appear} 500ms both;

  &:first-of-type {
    margin-top: 2rem;
  }

  &:hover {
    transform: translateY(-0.5rem);
    box-shadow: 0 3px 5px #8080807b;
  }

  &:first-of-type {
    margin-top: 1rem;
  }

  .ticket {
    position: absolute;
    top: 0;
    left: 0;
    background-color: ${({ theme, $isValid, $status }) => {
      if ($status == "ORDERED") {
        return $isValid
          ? theme.colors.kanban.ready
          : theme.colors.kanban.notReady;
      } else {
        if ($status == "AVOIR") return theme.colors.kanban.incomplete;
        return theme.colors.kanban.ready;
      }
    }};
    width: 45%;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    color: white;

    &::after {
      border-radius: 5px;
      display: block;
      position: absolute;
      right: -20px;
      content: "";
      width: 30px;
      height: 30px;
      background-color: white;
      transform: rotate(45deg);
    }
  }

  h1 {
    font-size: 13px;
    text-align: center;
  }

  .import-form {
    display: none;
  }

  .buttons {
    width: 100%;
    font-size: 1.25rem;
    position: absolute;
    bottom: 0.5rem;
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: baseline;

    div {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      justify-content: flex-end;

      &:first-of-type {
        padding-right: 0.5rem;
      }

      &:last-of-type {
        padding-left: 0.5rem;
      }
    }

    button {
      all: unset;

      &.upload svg {
        fill: #da8e00;
      }

      &.view svg {
        stroke: #5656ff;
      }

      &.validate svg {
        fill: green;
      }

      &.delete svg {
        * {
          fill: red;
        }
      }

      &.edit svg {
        fill: orange;
      }

      svg {
        transition: transform 250ms;

        &:hover {
          transform: translateY(-0.25rem);
        }
      }
    }
  }
`;

function KanbanItemComponent({
  order,
  moveItem,
  deleteItem,
  onOrderEdit: onOrderEdit,
}: {
  order: Order;
  moveItem?: () => void;
  deleteItem?: () => void;
  onOrderEdit?: (order: Order) => void;
}) {
  const { pushNotification } = useNotification();
  const [showReceiptsCaroussel, setShowReceiptsCaroussel] = useState(false);
  const [receiptIds, setReceiptIds] = useState<string[]>([]);

  useEffect(() => {
    api
      .get(`/receipt?orderId=${order.id}`)
      .then((res) => setReceiptIds(res.data.ids))
      .catch((e) => {
        console.error(e);
        pushNotification(
          "Impossible de récupérer les reçus associées au commande",
          "error"
        );
      });
  }, [order]);

  const map = new Map<KanbanItemStatus, string>([
    [KanbanItemStatusObject.PENDING, "En cours"],
    [KanbanItemStatusObject.RECEIVED, "Reçu"],
    [KanbanItemStatusObject.FINISHED, "Fini"],
    [KanbanItemStatusObject.AVOIR, "Avoir"],
  ]);

  const importButtonOnClick = () => {
    const input = document.querySelector(".import-input") as HTMLInputElement;
    input.click();
  };

  return (
    <>
      {showReceiptsCaroussel && (
        <ReceiptsCaroussel
          receiptIds={receiptIds}
          onClose={() => setShowReceiptsCaroussel(false)}
        />
      )}
      <StyledKanbanItemDiv $isValid={isValid(order)} $status={order.status}>
        <div className="ticket">
          {order.status == "ORDERED"
            ? isValid(order)
              ? "Prêt"
              : "Pas prêt"
            : map.get(order.status)}
        </div>
        <h1>
          {order.providerName +
            "_" +
            new Date(order.createdAt).toLocaleDateString().replace(/\//g, "-")}
        </h1>
        <div className="buttons">
          <div>
            {moveItem ? (
              <button
                title="Passer au suivant"
                className="validate"
                onClick={moveItem}>
                <BsCheckLg />
              </button>
            ) : null}
            {deleteItem ? (
              <button
                title="Revenir au précédent"
                className="delete"
                onClick={deleteItem}>
                <RxCross2 />
              </button>
            ) : null}
            {onOrderEdit ? (
              <button
                title={
                  order.status == KanbanItemStatusObject.RECEIVED
                    ? 'Mettre en "Avoir"'
                    : "Modifier"
                }
                className="edit"
                onClick={() => onOrderEdit(order)}>
                <MdEdit />
              </button>
            ) : null}
          </div>
          {order.status === "RECEIVED" && (
            <div>
              {receiptIds.length > 0 ? (
                <button
                  title="Voir les factures associées"
                  onClick={() => setShowReceiptsCaroussel(true)}
                  className="view">
                  <HiOutlineViewfinderCircle />
                </button>
              ) : null}
              <button
                title="Importer facture"
                onClick={importButtonOnClick}
                className="upload">
                <MdOutlineUploadFile />
              </button>
              <form
                className="import-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const data = new FormData(form);
                  data.set("orderId", order.id);

                  api
                    .post("/receipt", data)
                    .then((res) => {
                      setReceiptIds((ids) => [...ids, res.data.id]);
                    })
                    .catch((e) => {
                      console.error(e);
                      pushNotification(
                        "Une erreur s'est produite. Impossible d'envoyer le fichier au serveur",
                        "error"
                      );
                    });
                }}>
                <input
                  onChange={() => {
                    const submitBtn = document.querySelector(
                      "#submit-import-form"
                    ) as HTMLButtonElement;
                    submitBtn.click();
                  }}
                  type="file"
                  name="file"
                  className="import-input"
                  accept="image/png, image/jpeg, image/gif, application/pdf"
                />
                <button id="submit-import-form"></button>
              </form>
            </div>
          )}
        </div>
      </StyledKanbanItemDiv>
    </>
  );
}

export default function Kanban({
  title,
  orders,
  moveItems,
  moveItem,
  deleteItem,
  onOrderSelect,
}: KanbanProps) {
  const generateMoveItem = (i: number): (() => void | undefined) => {
    const order = orders[i];
    switch (order.status) {
      case KanbanItemStatusObject.ORDERED:
        if (isValid(order)) {
          return () => moveItem(i);
        }
        return undefined;
      case KanbanItemStatusObject.PENDING:
      case KanbanItemStatusObject.RECEIVED:
        return () => moveItem(i);
    }
    return undefined;
  };

  const generateDeleteItem = (i: number): (() => void | undefined) => {
    const order = orders[i];
    if (
      order.status != KanbanItemStatusObject.RECEIVED &&
      order.status != KanbanItemStatusObject.FINISHED
    ) {
      return () => deleteItem(i);
    }

    return undefined;
  };

  const generateEditItem = (i: number): (() => void | undefined) => {
    const order = orders[i];
    if (
      order.status == KanbanItemStatusObject.RECEIVED ||
      order.status == KanbanItemStatusObject.ORDERED
    ) {
      return () => onOrderSelect(order);
    }
    return undefined;
  };

  const navigate = useNavigate();

  return (
    <StyledDiv>
      <header>
        <h1>{title}</h1>
        <div className="buttons">
          {title == "Commandes" ? (
            <button className="add">
              <MdPostAdd
                onClick={() => navigate("/order/create")}
                title="Créer fournisseur"
              />
            </button>
          ) : null}
          {moveItems ? (
            <button className="move-all">
              <GoMoveToEnd
                title="Envoyer à la prochaine étape"
                onClick={moveItems}
              />
            </button>
          ) : null}
        </div>
      </header>
      <StyledKanban $size={orders.length}>
        {orders.map((order, i) => (
          <KanbanItemComponent
            key={i}
            order={order}
            moveItem={generateMoveItem(i)}
            deleteItem={generateDeleteItem(i)}
            onOrderEdit={generateEditItem(i)}
          />
        ))}
      </StyledKanban>
    </StyledDiv>
  );
}
