import { lighten } from "polished";
import React, { useEffect, useState } from "react";
import { HiOutlineViewfinderCircle } from "react-icons/hi2";
import { RiFileForbidLine } from "react-icons/ri";
import { MoonLoader } from "react-spinners";
import styled from "styled-components";
import { api } from "../../api";
import { Header } from "../../components";
import { ArchivedOrder } from "../../models";
import { theme } from "../../styles/theme";
import ReceiptsCaroussel from "../order/components/ReceiptsCaroussel";

const StyledArchives = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 0.4fr;
  margin: 1rem 2rem;
  box-shadow: 0 0 5px grey;
  border-radius: 5px;
  overflow: hidden;
  max-height: 80vh;

  & > div {
    height: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-left: solid 1px #80808035;
    text-align: center;
    font-weight: 500;
    padding: 0.5rem 0;
  }

  .header {
    color: white;
    font-weight: bold;

    &:nth-of-type(odd) {
      background-color: ${({ theme }) => lighten(0.15, theme.colors.tertiary)};
    }
    &:nth-of-type(even) {
      background-color: ${({ theme }) => theme.colors.tertiary};
    }
  }

  .odd {
    background-color: ${({ theme }) => lighten(0.25, theme.colors.secondary)};
  }

  button {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: ${({ theme }) => theme.colors.buttons.view};
    border: none;
    border-radius: 5px;
    padding: 5px 15px;
    cursor: pointer;
    transition: background-color 250ms;

    &:hover {
      background-color: ${({ theme }) =>
        lighten(0.1, theme.colors.buttons.view)};
    }

    span {
      font-size: 1rem;
      color: white;
      font-weight: bold;
    }

    svg {
      stroke: white;
      font-size: 2rem;
    }
  }

  .disabled {
    opacity: 0.25;
    cursor: not-allowed;

    &:hover {
      background-color: ${({ theme }) => theme.colors.buttons.view};
    }
  }
`;

const StyleHeaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;

  .empty {
    display: flex;
    align-items: center;
    gap: 2rem;

    h2 {
      font-size: 3rem;
    }

    svg {
      font-size: 4rem;
    }
  }
`;

function Archive() {
  const [archivedOrders, setArchivedOrders] = useState<ArchivedOrder[]>([]);
  const [pending, setPending] = useState(true);
  const [showReceiptsCaroussel, setShowReceiptsCaroussel] = useState(false);
  const [receiptIds, setReceiptIds] = useState<string[]>([]);

  useEffect(() => {
    api
      .get("/archived-order")
      .then((res) => {
        console.table(res.data);
        setArchivedOrders(res.data);
        setPending(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    console.log(archivedOrders);
  }, [archivedOrders]);

  const showCaroussel = (archivedOrder: ArchivedOrder) => {
    setReceiptIds(archivedOrder.receipts.map((receipt) => receipt.id));
    setShowReceiptsCaroussel(true);
  };

  return (
    <>
      <Header headerTitle="Factures 🎫" />

      {pending ? (
        <StyleHeaderContainer>
          <MoonLoader color={theme.colors.secondary} />
        </StyleHeaderContainer>
      ) : (
        <>
          {archivedOrders.length > 0 ? (
            <StyledArchives>
              <div className="header">Nom du fournisseur</div>
              <div className="header">Date de création</div>
              <div className="header">Date de création de la commande</div>
              <div className="header"></div>
              {archivedOrders.map((order, i) => (
                <React.Fragment key={i}>
                  <div className={i % 2 ? "odd" : ""}>{order.providerName}</div>
                  <div className={i % 2 ? "odd" : ""}>
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div className={i % 2 ? "odd" : ""}>
                    {new Date(order.orderCreationDate).toLocaleString()}
                  </div>
                  <div className={i % 2 ? " odd" : ""}>
                    <button
                      className={
                        order.receipts && order.receipts.length == 0
                          ? "disabled"
                          : ""
                      }
                      onClick={() => {
                        if (order.receipts && order.receipts.length > 0) {
                          showCaroussel(order);
                        }
                      }}
                    >
                      <HiOutlineViewfinderCircle />
                      <span>Voir</span>
                    </button>
                  </div>
                </React.Fragment>
              ))}
            </StyledArchives>
          ) : (
            <StyleHeaderContainer>
              <div className="empty">
                <h2>Aucune facture archivée </h2>
                <RiFileForbidLine />
              </div>
            </StyleHeaderContainer>
          )}
        </>
      )}
      {showReceiptsCaroussel && (
        <ReceiptsCaroussel
          receiptIds={receiptIds}
          onClose={() => setShowReceiptsCaroussel(false)}
        />
      )}
    </>
  );
}

export default Archive;
