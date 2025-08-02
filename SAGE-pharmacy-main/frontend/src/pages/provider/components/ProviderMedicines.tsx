import { darken, lighten } from "polished";
import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { TbBasketCancel } from "react-icons/tb";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../../api";
import { ConfirmationDialog } from "../../../components";
import { Provider } from "../../../models";
import { appear } from "../../../styles/animations";
import { theme } from "../../../styles/theme";
import ProviderInfo from "./ProviderInfo";

const StyledTitle = styled.div`
  display: flex;
  justify-content: space-between;

  .header {
    display: flex;
    align-items: center;
    gap: 1rem;

    h1 {
      color: ${({ theme }) => theme.colors.tertiary};
      font-size: 2rem;
    }

    button {
      height: 3rem;
      padding: 5px 20px;
      border: none;
      color: white;
      font-weight: 600;
      border-radius: 5px;
      transition: all 250ms;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: chocolate;

      span {
        font-weight: bold;
        color: white;
      }
      svg {
        font-size: 1.25rem;
        fill: white;
      }
    }
  }

  .buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-right: 2rem;

    .appear {
      transform: translateY(0);
      opacity: 1;
      cursor: pointer;
    }

    button {
      height: 3rem;
      padding: 5px 20px;
      border: none;
      color: white;
      font-weight: 600;
      border-radius: 5px;
      transition: all 250ms;
      cursor: pointer;

      &:first-of-type {
        background-color: ${({ theme }) => theme.colors.tertiary};
        opacity: 0;

        &:hover {
          background-color: ${({ theme }) =>
            lighten(0.1, theme.colors.tertiary)};
        }
      }

      &:nth-of-type(2) {
        background-color: ${({ theme }) => theme.colors.buttons.edit};

        &:hover {
          background-color: ${({ theme }) =>
            lighten(0.1, theme.colors.buttons.edit)};
        }
      }

      &:last-of-type {
        background-color: ${({ theme }) => theme.colors.buttons.delete};

        &:hover {
          background-color: ${({ theme }) =>
            lighten(0.1, theme.colors.buttons.delete)};
        }
      }
    }
  }
`;

const StyledList = styled.div`
  border: solid 1px black;
  border-radius: 5px;
  animation: ${appear} both 500ms;
  overflow: auto;
  max-height: 80vh;
  margin-bottom: 1rem;

  table {
    border-collapse: collapse;
    width: 100%;
    height: 100%;

    tr {
      &.low {
        td {
          background-color: ${({ theme }) => theme.colors.lowStock};
        }
      }

      &.near-expiration {
        td {
          background-color: ${({ theme }) => theme.colors.nearExpiration};
        }
      }

      &.low.near-expiration {
        td {
          background-color: ${({ theme }) => theme.colors.lowAndNearExpiration};

          &:nth-of-type(4) {
            color: red;
            font-weight: 700;
          }
        }

        &.selected {
          td {
            background-color: ${({ theme }) => theme.colors.selectedRow};
          }
        }
      }

      &.selected {
        * {
          color: white;
        }
        td {
          background-color: ${({ theme }) => theme.colors.selectedRow};
        }
      }

      &:nth-of-type(odd) {
        background-color: ${({ theme }) => darken(0.025, theme.colors.primary)};
      }

      &:nth-of-type(even) {
        background-color: ${({ theme }) =>
          lighten(0.6, theme.colors.secondary)};
      }
    }

    td,
    th {
      text-align: center;
      height: 3rem;
    }

    th {
      color: white;
    }

    td {
      min-width: 10rem;
      overflow-y: auto;

      select {
        cursor: pointer;
        width: 85%;
        height: 70%;
      }

      &:not(:last-of-type) {
        border-right: solid 1px black;
      }

      input[type="checkbox"] {
        cursor: pointer;
        width: 1.15rem;
        height: 1.15rem;
      }

      &:first-of-type {
        text-align: start;
        display: flex;
        gap: 1rem;
        align-items: center;
        padding-left: 1rem;
        min-width: 240px;

        & > div {
          height: 100%;
          overflow-y: auto;
          display: flex;
          align-items: center;
        }

        & > div > div {
          max-width: 200px;
          outline: none;

          &::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          &::-webkit-scrollbar-track {
            background: #80808017;
          }

          &::-webkit-scrollbar-thumb {
            background: ${({ theme }) => theme.colors.tertiary};
          }

          &::-webkit-scrollbar-thumb:hover {
            background: ${({ theme }) => lighten(0.2, theme.colors.tertiary)};
          }
        }
      }
    }
  }

  thead {
    position: sticky;
    top: 0;
    user-select: none;

    tr {
      th {
        padding: 5px 15px;
        color: white;
        cursor: pointer;

        .inner-th {
          display: flex;
          align-items: center;
          justify-content: space-between;

          p {
            color: white;
          }

          .arrows {
            display: flex;
            flex-direction: column-reverse;

            * {
              color: white;
              font-size: 0.6rem;
              cursor: pointer;
            }
          }
        }

        &:first-of-type {
          border-radius: 5px 0 0 0;
        }

        &:last-of-type {
          border-radius: 0 5px 0 0;
        }

        &:nth-of-type(odd) {
          background-color: ${({ theme }) => theme.colors.tertiary};
        }

        &:nth-of-type(even) {
          background-color: ${({ theme }) =>
            lighten(0.1, theme.colors.tertiary)};
        }
      }
    }
  }
`;

const StyledH2 = styled.h2`
  font-size: 4rem;
  font-weight: normal;
  margin-top: 15rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  animation: 500ms both ${appear};
  position: relative;
  display: flex;
  align-items: center;
  gap: 3rem;

  svg {
    font-size: 6rem;
  }
`;

export default function ProviderMedicines() {
  const { id: providerId } = useParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [medicineNames, setMedicineNames] = useState<string[]>([]);
  const [correspondances, setCorrespondances] = useState<string[]>([]);
  const [changedCorrespondances, setChangedCorrespondances] = useState(false);
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showProviderInfo, setShowProviderInfo] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api
      .get("/stock/medicine-names")
      .then((res) => {
        const names: string[] = res.data.names;
        setMedicineNames(names);
      })
      .catch((err) => console.error(err));

    api
      .get("provider/" + providerId)
      .then((res) => {
        setProvider(res.data);
      })
      .catch((err) => console.error(err));
  }, [location.pathname]);

  const dateToLocaleFormat = (date: string) => {
    let s = new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    let pos = s.indexOf(" ") + 1;
    s = s.slice(0, pos) + s[pos].toUpperCase() + s.slice(pos + 1);
    return s;
  };

  const isThereCorrespondancesChanges = () => {
    const selects = document.querySelectorAll("select");
    for (let i = 0; i < selects.length; i++) {
      if (selects[i].value != correspondances[i]) return true;
    }
    return false;
  };

  useEffect(() => {
    if (provider) {
      const tmp: string[] = [];
      provider.medicines.forEach((medicine) => {
        if (medicine.matchingMedicines.length > 0)
          tmp.push(medicine.matchingMedicines[0].name);
        else tmp.push("none");
      });
      setCorrespondances(tmp);
    }
  }, [provider]);

  useEffect(() => {
    setChangedCorrespondances(false);
  }, [location]);

  const updateCorrespondances = () => {
    const correspondancesToChange: {
      id: string;
      name: string;
    }[] = [];

    const selects = document.querySelectorAll("select");
    selects.forEach((select) => {
      const el = select as HTMLSelectElement;
      correspondancesToChange.push({
        id: select.getAttribute("data-medicine-id"),
        name: el.value,
      });
    });

    api
      .post("/provider/medicine/update-matches", {
        matches: correspondancesToChange,
      })
      .catch((err) => console.error(err))
      .finally(() => navigate(0));
  };

  const handleChanges = () => {
    setChangedCorrespondances(isThereCorrespondancesChanges);
  };

  const deleteProvider = () => {
    api
      .delete("/provider/" + providerId)
      .then(() => {
        navigate("/stock");
      })
      .catch((err) => console.log(err));
  };

  if (!provider) return null;

  const appendOtherMedicines = (e: React.MouseEvent<HTMLSelectElement>) => {
    for (let name of medicineNames) {
      if (name == e.currentTarget.value) {
        continue;
      }
      let option = document.createElement("option");
      option.innerText = name;
      option.value = name;
      e.currentTarget.appendChild(option);
    }
  };

  return (
    <>
      <StyledTitle>
        <div className="header">
          <h1>{provider.name}</h1>
          <button
            title="Modifier"
            onClick={() => navigate("/provider/edit/" + providerId)}
          >
            <MdModeEdit />
            <span>Modifier</span>
          </button>
        </div>
        <div className="buttons">
          <button
            disabled={!changedCorrespondances}
            className={changedCorrespondances ? "appear" : ""}
            onClick={() => setShowChangeConfirmation(true)}
          >
            Enregistrer Modif.
          </button>
          <button onClick={() => setShowProviderInfo(true)}>
            Informations
          </button>
          <button onClick={() => setShowDeleteConfirmation(true)}>
            Supprimer
          </button>
        </div>
      </StyledTitle>
      {provider && provider.medicines.length > 0 ? (
        <StyledList>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prix HT</th>
                <th>Prix TTC</th>
                <th>Quantité Disp.</th>
                <th>DCI</th>
                <th>Expiration</th>
                <th>Correspondance</th>
              </tr>
            </thead>
            <tbody>
              {provider.medicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td>{medicine.name}</td>
                  <td>{medicine.priceWithoutTax}</td>
                  <td>{medicine.priceWithTax}</td>
                  <td>{medicine.quantity}</td>
                  <td>{medicine.dci}</td>
                  <td>{dateToLocaleFormat(medicine.expirationDate)}</td>
                  <td>
                    <select
                      name="correspondance"
                      id="correspondance"
                      defaultValue={
                        medicine.matchingMedicines.length > 0
                          ? medicine.matchingMedicines[0].name
                          : "none"
                      }
                      data-medicine-id={medicine.id}
                      onChange={handleChanges}
                      onClick={appendOtherMedicines}
                    >
                      <option value="none">Aucun</option>
                      {medicine.matchingMedicines.map((medicine, i) => (
                        <option
                          key={i}
                          value={medicine.name}
                          className="appended"
                        >
                          {medicine.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </StyledList>
      ) : (
        <StyledH2>
          <span>Liste de Médicament vide</span>
          <TbBasketCancel />
        </StyledH2>
      )}
      {showChangeConfirmation ? (
        <ConfirmationDialog
          title="Enregistrer Modification"
          action={updateCorrespondances}
          cancel={{ buttonColor: theme.colors.cancelButton, text: "Annuler" }}
          confirm={{
            buttonColor: theme.colors.acceptButton,
            text: "Enregistrer",
          }}
          message="Voulez-vous enregistrer les changements?"
          onClose={() => setShowChangeConfirmation(false)}
        />
      ) : null}
      {showDeleteConfirmation ? (
        <ConfirmationDialog
          title="Supprimer le fournisseur"
          action={deleteProvider}
          cancel={{ buttonColor: theme.colors.tertiary, text: "Annuler" }}
          confirm={{
            buttonColor: theme.colors.cancelButton,
            text: "Supprimer",
          }}
          message="Voulez-vous supprimer le fournisseur?"
          onClose={() => setShowDeleteConfirmation(false)}
        />
      ) : null}
      {showProviderInfo ? (
        <ProviderInfo onClose={() => setShowProviderInfo(false)} />
      ) : null}
    </>
  );
}
