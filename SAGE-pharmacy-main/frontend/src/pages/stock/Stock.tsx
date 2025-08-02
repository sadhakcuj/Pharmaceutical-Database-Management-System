import { lighten } from "polished";
import { useCallback, useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { CgFileAdd } from "react-icons/cg";
import { FiEdit } from "react-icons/fi";
import { MdOutlineTabUnselected, MdSelectAll } from "react-icons/md";
import { TbBasketCancel } from "react-icons/tb";
import { MoonLoader } from "react-spinners";
import styled from "styled-components";
import { api } from "../../api";
import {
  AddForm,
  ConfirmationDialog,
  Header,
  Pagination,
  Searchbar,
  UpdateForm,
} from "../../components";
import { useNotification } from "../../hooks";
import { Medicine } from "../../models";
import { appear, appearFromLeft } from "../../styles/animations";
import { Table } from "./components";

type PageQueryResponse = {
  data: Medicine[];
  pageCount: number;
  page: number;
};

const StyledHeader = styled(Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .add-btn {
    background-color: ${({ theme }) => theme.colors.buttons.add};

    &:hover {
      background-color: ${({ theme }) =>
        lighten(0.1, theme.colors.buttons.add)};
    }
  }

  .edit-btn {
    background-color: ${({ theme }) => theme.colors.buttons.edit};

    &:hover {
      background-color: ${({ theme }) =>
        lighten(0.1, theme.colors.buttons.edit)};
    }
  }

  .delete-btn {
    background-color: ${({ theme }) => theme.colors.buttons.delete};

    &:hover {
      background-color: ${({ theme }) =>
        lighten(0.1, theme.colors.buttons.delete)};
    }
  }

  .select-all-btn {
    background-color: ${({ theme }) => theme.colors.selectAllBackground};

    &:hover {
      background-color: ${({ theme }) =>
        lighten(0.1, theme.colors.selectAllBackground)};
    }
  }

  button {
    border: none;
    height: 2.5rem;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 250ms;
    font-weight: bold;

    * {
      color: white;
    }

    svg {
      font-size: 1.25rem;
    }
  }

  & > div {
    display: flex;
    gap: 2rem;
  }

  .buttons {
    animation: 500ms ease-out both ${appearFromLeft};
    display: flex;
    gap: 1rem;
  }
`;

const StyledStock = styled.div`
  padding: 0 3rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  position: relative;

  .count {
    margin: unset;
    margin-top: -1rem;
    margin-bottom: 1rem;
  }

  .pending {
    position: absolute;
    top: 25vh;
    left: 50%;
    transform: translateX(-50%);
  }

  h2 {
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
`;

export default function Stock() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pagesCount, setPagesCount] = useState(1);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedRows, setSelectedRows] = useState<Medicine[]>([]);
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalCount, setTotalCount] = useState(-1);
  const [searchField, setSearchField] = useState<
    | "name"
    | "sellingPrice"
    | "costPrice"
    | "quantity"
    | "location"
    | "dci"
    | "min"
    | "max"
    | "real"
    | "nomenclature"
    | "family"
    | "alert"
    | "reference"
  >("name");
  const [pending, setPending] = useState(true);

  // Modal for medicine edition will appear when set
  const [updateSelectedRows, setUpdateSelectedRows] = useState(false);
  const { pushNotification } = useNotification();

  useEffect(() => {
    api
      .get("/stock/medicine-count")
      .then((res) => setTotalCount(res.data))
      .catch((err) =>
        console.error(`Failed to get total medicine count : ${err}`)
      );
  }, []);

  useEffect(() => {
    // clear selections
    setSelectedRows([]);

    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set(searchField, searchKeyWord);

    api
      .get(`/stock?${params}`)
      .then((response) => {
        const res: PageQueryResponse = response.data;
        setMedicines(res.data);
        setPagesCount(res.pageCount);
      })
      .catch((err) => console.error(err))
      .finally(() => setPending(false));
  }, [searchKeyWord, searchField, currentPage]);

  const toggleMedicine = (medicine: Medicine) => {
    setSelectedRows((rows) =>
      rows.findIndex(({ id }) => id === medicine.id) >= 0
        ? rows.filter(({ id }) => id !== medicine.id)
        : [medicine, ...rows]
    );
  };

  const updateRows = () => {
    if (selectedRows.length > 0) setUpdateSelectedRows(true);
    else console.error("No row selected!");
  };

  const deleteSelectedRows = () => {
    setShowConfirmation(false);
    const idsToDelete = selectedRows.map((row) => row.id);

    api
      .post("/stock", {
        ids: idsToDelete,
      })
      .then(() => {
        pushNotification("Suppression réussie");
        fetchMedicines();
      })
      .catch((err) => console.error(err));
  };

  const fetchMedicines = useCallback(() => {
    // clear selections
    setSelectedRows([]);

    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set(searchField, searchKeyWord);

    api
      .get(`/stock?${params}`)
      .then((response) => {
        const res: PageQueryResponse = response.data;
        setMedicines(res.data);
        setPagesCount(res.pageCount);
      })
      .catch((err) => console.error(err));
  }, [searchKeyWord, searchField, currentPage]);

  const toggleAllRows = (toggle: boolean) => {
    setSelectedRows(toggle ? medicines : []);
  };

  return (
    <>
      <StyledHeader headerTitle="Stock 📦">
        <div>
          <Searchbar
            onFieldChange={(field) => setSearchField(field as any)}
            onKeywordChange={(keyword) => {
              setCurrentPage(0);
              setSearchKeyWord(keyword);
            }}
            fields={[
              {
                name: "Désignation",
                value: "name",
              },
              {
                name: "Nomenclature",
                value: "nomenclature",
              },
              {
                name: "Famille",
                value: "family",
              },
              {
                name: "Référence",
                value: "reference",
              },
              {
                name: "Prix d'achat",
                value: "costPrice",
              },
              {
                name: "Prix de vente",
                value: "sellingPrice",
              },
              {
                name: "Stock d'alerte",
                value: "alert",
              },
              {
                name: "Stock réel",
                value: "real",
              },
              {
                name: "Stock à terme",
                value: "quantity",
              },
              {
                name: "Emplacement",
                value: "location",
              },
              {
                name: "DCI",
                value: "dci",
              },
              {
                name: "Stock Min",
                value: "min",
              },
              {
                name: "Stock Max",
                value: "max",
              },
            ]}
          />
          <div className="buttons">
            <button
              className="select-all-btn"
              title={
                selectedRows.length != medicines.length
                  ? "Tout sélectionner"
                  : "Tout désélectionner"
              }
              onClick={() =>
                toggleAllRows(selectedRows.length != medicines.length)
              }
            >
              {selectedRows.length == medicines.length ? (
                <MdOutlineTabUnselected />
              ) : (
                <MdSelectAll />
              )}
            </button>
            <button className="add-btn" onClick={() => setShowAddForm(true)}>
              <CgFileAdd />
              <span>Ajouter</span>
            </button>
            {selectedRows.length > 0 && (
              <>
                <button className="edit-btn" onClick={updateRows}>
                  <FiEdit />
                  <span>Modifier</span>
                </button>
                <button
                  className="delete-btn"
                  onClick={() => setShowConfirmation(true)}
                >
                  <AiOutlineDelete />
                  <span>Supprimer</span>
                </button>
              </>
            )}
          </div>
        </div>
      </StyledHeader>
      <StyledStock>
        <>
          {pending ? (
            <div className="pending">
              <MoonLoader color="#90B77D" loading={pending} size={64} />
            </div>
          ) : (
            <>
              {totalCount >= 0 && (
                <small className="count">
                  💊 {totalCount} produits chargés
                </small>
              )}
              {medicines.length > 0 ? (
                <>
                  <Table
                    medicines={medicines}
                    selectedRowIds={selectedRows.map((medicine) => medicine.id)}
                    onRowToggle={toggleMedicine}
                  />
                  {pagesCount > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      pagesCount={pagesCount}
                    />
                  )}
                </>
              ) : (
                <h2>
                  <span>Stock vide</span>
                  <TbBasketCancel />
                </h2>
              )}
            </>
          )}
        </>
      </StyledStock>
      {updateSelectedRows ? (
        <UpdateForm
          selectedRows={selectedRows}
          onClose={(update) => {
            if (update) {
              fetchMedicines();
              pushNotification("Produit modifié avec succès");
            }
            setUpdateSelectedRows(false);
          }}
        />
      ) : null}
      {showAddForm ? (
        <AddForm
          onClose={(submited) => {
            setShowAddForm(false);

            if (submited) {
              fetchMedicines();
              pushNotification("Produit ajouté avec succès.");
            }
          }}
        />
      ) : null}
      {showConfirmation ? (
        <ConfirmationDialog
          title={`Supprimer ${selectedRows.length > 1 ? "les" : "l'"} élément${
            selectedRows.length > 1 ? "s" : ""
          }`}
          message={`Cette action est irreversible. Voulez vous vraiment supprimer ${
            selectedRows.length > 1 ? "les" : "l'"
          } élément${selectedRows.length > 1 ? "s" : ""}?`}
          cancel={{ buttonColor: "grey", text: "Annuler" }}
          confirm={{ buttonColor: "red", text: "Supprimer" }}
          onClose={() => setShowConfirmation(false)}
          action={deleteSelectedRows}
        />
      ) : null}
    </>
  );
}
