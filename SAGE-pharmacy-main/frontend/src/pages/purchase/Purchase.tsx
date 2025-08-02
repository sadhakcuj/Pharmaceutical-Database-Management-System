import { lighten } from "polished";
import React, { useEffect, useState } from "react";
import { TbBasketCancel } from "react-icons/tb";
import { MoonLoader } from "react-spinners";
import styled from "styled-components";
import { api } from "../../api";
import { ConfirmationDialog, Header } from "../../components";
import { useNotification } from "../../hooks";
import { MedicineFromProvider } from "../../models";
import { appear } from "../../styles/animations";
import { useNavigate } from "react-router-dom";

// Converted map from request response from /provider/provide to common JS object
type MatchMedicine = {
  name: string;
  stockMin?: number;
  providerMedicines: {
    medicine: MedicineFromProvider;
    provider: { name: string };
    quantityToOrder: number;
  }[];
};

type ValueFromSelectBox = {
  medicine: MedicineFromProvider;
  providerName: string;
  order: number;
  id: string;
};

const StyledPurchase = styled.div`
  padding: 0 2rem;
  position: relative;

  input[type="checkbox"] {
    width: 1.125rem;
    height: 1.125rem;
  }

  .unbold {
    font-weight: normal !important;
  }

  .checkbox {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;

    label {
      cursor: pointer;
    }
  }

  .pending {
    position: absolute;
    top: 25vh;
    left: 50%;
    transform: translateX(-50%);
  }

  .table {
    display: grid;
    animation: ${appear} 500ms 500ms both;
    grid-template-columns: 0.75fr 1fr 0.5fr 1fr 0.5fr 0.5fr;
    grid-auto-rows: 50px;
    border: solid 1px black;
    width: fit-content;
    border-radius: 5px;
    max-height: ${({ theme }) => theme.sizes.purchaseHeight};
    overflow-y: auto;
    width: 100%;

    input[type="number"] {
      border: none;
      outline: none;
      text-align: center;
      border-right: solid 1px black;
      font-weight: 700;
    }

    > div {
      display: flex;
      justify-content: center;
      align-items: center;
      border-right: solid 1px black;
      font-weight: 600;

      select {
        cursor: pointer;
        height: 2rem;
        width: 85%;
        border-radius: 4px;
        font-weight: bolder;
      }
    }

    .name {
      padding: 0 1rem;
      overflow-x: auto;
      justify-content: flex-start;
      min-width: max-content;
    }

    .header-item {
      position: sticky;
      top: 0;
      background-color: red;
      color: white;

      &:first-of-type {
        input {
          cursor: pointer;
          width: 1.25rem;
          height: 1.25rem;
          position: absolute;
          left: 1rem;
        }

        span {
          color: white;
        }
      }

      &:nth-of-type(odd) {
        background-color: ${({ theme }) => theme.colors.tertiary};
      }

      &:nth-of-type(even) {
        background-color: ${({ theme }) => theme.colors.secondary};
      }
    }

    .odd {
      background-color: #80808051;
    }

    .even {
      background-color: white;
    }
  }

  h2 {
    height: 100%;
    font-size: 4rem;
    font-weight: normal;
    margin-top: 15rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3rem;
    animation: 500ms both ${appear};

    svg {
      font-size: 6rem;
    }
  }

  .medicine-name {
    min-width: 350px;
    text-align: center;
  }

  .quantity {
    min-width: 120px;
    text-align: center;
  }

  .provider-name {
    min-width: 200px;
    text-align: center;
  }

  .price-with-tax,
  .price-without-tax {
    min-width: 150px;
    text-align: center;
  }
`;

const StyledHeader = styled(Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .buttons {
    button {
      background-color: ${({ theme }) => theme.colors.tertiary};
      color: white;
      font-weight: 600;
      height: 3rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      padding: 5px 10px;
      transition: background-color 250ms;

      &:hover {
        background-color: ${({ theme }) => lighten(0.1, theme.colors.tertiary)};
      }
    }
  }
`;

const Purchase = () => {
  // Medicines proposed from GET /api/provider/provide
  const [matchedMedicines, setMatchedMedicines] = useState<MatchMedicine[]>([]);
  const [selectedRowIndices, setselectedRowIndices] = useState<number[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pending, setPending] = useState(true);

  const [currentProviders, setCurrentProviders] = useState<string[]>([]);
  const [currentMedicines, setCurrentMedicines] = useState<
    {
      id: string;
      order: number;
      available: number;
      unitPriceWithTax: number;
      unitPriceWithoutTax: number;
    }[]
  >([]);

  const { pushNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatas = async () => {
      // Get all matched near-low quantity medicines
      const res = await api.get("/provider/provide");

      const matchingMedicines: MatchMedicine[] = res.data;
      setMatchedMedicines(matchingMedicines);

      setCurrentProviders(
        matchingMedicines.map(
          (medicine) => medicine.providerMedicines[0].provider.name
        )
      );

      setCurrentMedicines(
        matchingMedicines.map((med) => {
          const medicine = med.providerMedicines[0];
          const { quantity, priceWithTax, priceWithoutTax, id } =
            medicine.medicine;

          return {
            id,
            order: medicine.quantityToOrder,
            available: quantity,
            unitPriceWithoutTax: priceWithoutTax * quantity,
            unitPriceWithTax: priceWithTax * quantity,
          };
        })
      );
    };

    fetchDatas()
      .catch((err) => {
        if (err.response.status !== 404) {
          pushNotification("Une erreur s'est produite", "error");
          console.error(err);
        }
      })
      .finally(() => setPending(false));
  }, []);

  // Get current data set up by the user and create a purchase list (set "order" state)
  const orderMedicines = () => {
    const orders = selectedRowIndices.map((i) => {
      const medicine = currentMedicines[i];
      return {
        medicineId: medicine.id,
        quantityToOrder: medicine.order,
      };
    });

    api
      .post("/order", {
        orders,
      })
      .then(() => navigate("/order"))
      .catch((err) => console.error(err));
  };

  const selectedMedicineOnChange = (
    medicineIndex: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const obj: ValueFromSelectBox = JSON.parse(event.currentTarget.value);

    const { medicine, providerName, order, id } = obj;

    setCurrentProviders((list) => {
      list[medicineIndex] = providerName;
      return [...list];
    });

    setCurrentMedicines((medicines) => {
      const row = medicines[medicineIndex];
      row.order = order;
      row.unitPriceWithTax = medicine.priceWithTax;
      row.unitPriceWithoutTax = medicine.priceWithoutTax;
      row.id = id;

      return [...medicines];
    });
  };

  const orderInputValueOnChange = (
    medicineIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const defaultValue = e.currentTarget.defaultValue;
    const maxValue = e.currentTarget.max;
    if (isNaN(parseInt(e.currentTarget.value))) {
      e.currentTarget.value = defaultValue;
    }
    if (parseInt(e.currentTarget.value) > parseInt(maxValue)) {
      e.currentTarget.value = maxValue;
    }

    const order = parseInt(e.currentTarget.value);
    setCurrentMedicines((rows) => {
      const row = rows[medicineIndex];
      row.order = order;
      return [...rows];
    });
  };

  return (
    <>
      <StyledHeader headerTitle="Achats 🛒">
        <div className="buttons">
          <button
            onClick={() => {
              if (selectedRowIndices.length === 0) {
                pushNotification(
                  "Sélectionner des lignes pour créer les bons de commande!",
                  "warning"
                );
              } else {
                setShowConfirmation(true);
              }
            }}>
            Commander
          </button>
        </div>
      </StyledHeader>
      <StyledPurchase>
        {pending ? (
          <div className="pending">
            <MoonLoader color="#90B77D" loading={pending} size={64} />
          </div>
        ) : (
          <>
            {matchedMedicines.length > 0 ? (
              <div className="table">
                <>
                  <div className="header-item">
                    <input
                      type="checkbox"
                      title={
                        selectedRowIndices.length === matchedMedicines.length
                          ? "Tout désélectionner"
                          : "Tout sélectionner"
                      }
                      checked={
                        selectedRowIndices.length === matchedMedicines.length
                      }
                      onChange={(e) => {
                        if (!e.currentTarget.checked) {
                          setselectedRowIndices([]);
                        } else {
                          setselectedRowIndices(
                            matchedMedicines.map((_, i) => i)
                          );
                        }
                      }}
                    />
                    <span>En rupture</span>
                  </div>
                  <div className="header-item">Depuis fournisseur</div>
                  <div className="header-item">A commander</div>
                  <div className="header-item">Fournisseur</div>
                  <div className="header-item">Total TTC</div>
                  <div className="header-item">Total HT</div>
                </>
                {matchedMedicines.map((medicine, i) => (
                  <React.Fragment key={i}>
                    {/* medicine name in stock */}
                    <div
                      className={[
                        "checkbox",
                        "name",
                        i % 2 == 0 ? "even" : "odd",
                      ].join(" ")}>
                      <input
                        type="checkbox"
                        id={medicine.name}
                        checked={selectedRowIndices.includes(i)}
                        onChange={(e) => {
                          if (e.currentTarget.checked) {
                            setselectedRowIndices((indices) => [...indices, i]);
                          } else {
                            setselectedRowIndices((indices) =>
                              indices.filter((index) => i !== index)
                            );
                          }
                        }}
                      />
                      <label htmlFor={medicine.name}>{medicine.name}</label>
                    </div>
                    {/* medicine name from provider */}
                    <div className={i % 2 == 0 ? "even" : "odd"}>
                      {medicine.providerMedicines.length == 1 ? (
                        <div className="medicine-name">
                          {medicine.providerMedicines[0].medicine.name}
                        </div>
                      ) : (
                        <select
                          name={medicine.name}
                          id={medicine.name}
                          onChange={(e) => selectedMedicineOnChange(i, e)}>
                          {medicine.providerMedicines.map((match, i) => (
                            <option
                              key={i}
                              value={JSON.stringify({
                                id: match.medicine.id,
                                medicine: match.medicine,
                                providerName: match.provider.name,
                                order: match.quantityToOrder,
                              })}>
                              {match.medicine.name +
                                " (" +
                                match.provider.name +
                                ")"}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {/* quantity to purchase */}
                    <input
                      className={`quantity ${i % 2 == 0 ? "even" : "odd"}`}
                      type="number"
                      key={currentMedicines[i].order}
                      value={currentMedicines[i].order}
                      min={medicine.stockMin}
                      max={currentMedicines[i].available}
                      onChange={(e) => orderInputValueOnChange(i, e)}
                    />
                    {/* provider's name */}
                    <div
                      className={`provider-name ${
                        i % 2 == 0 ? "even" : "odd"
                      }`}>
                      {currentProviders[i]}
                    </div>
                    {/* price with taxes */}
                    <div
                      className={
                        "price-with-tax unbold " + (i % 2 == 0 ? "even" : "odd")
                      }>
                      {currentMedicines[i].order *
                        currentMedicines[i].unitPriceWithTax}
                    </div>
                    {/* price without taxes */}
                    <div
                      className={
                        "price-without-tax unbold " +
                        (i % 2 == 0 ? "even" : "odd")
                      }>
                      {currentMedicines[i].order *
                        currentMedicines[i].unitPriceWithoutTax}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <h2>
                <span>Achat vide</span>
                <TbBasketCancel />
              </h2>
            )}
          </>
        )}
      </StyledPurchase>
      {showConfirmation ? (
        <ConfirmationDialog
          action={() => {
            orderMedicines();
            setShowConfirmation(false);
          }}
          title="Confirmer la commande?"
          message="Voulez-vous vraimnet commander les produits listés?"
          confirm={{ text: "Commander", buttonColor: "green" }}
          cancel={{ text: "Annuler", buttonColor: "red" }}
          onClose={() => setShowConfirmation(false)}
        />
      ) : null}
    </>
  );
};

export default Purchase;
