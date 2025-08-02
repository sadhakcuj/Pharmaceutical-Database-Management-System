import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../../api";

const StyledHeader = styled.div`
  border-bottom: 1px solid #00000025;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 5px 5px 0 0;

  input {
    width: 360px;
    padding: 10px 5px;
    font-size: 1rem;
    border-radius: 5px;
    border: none;
    padding-left: 1rem;

    &:focus {
      outline: none;
    }
  }

  p {
    margin: unset;
    font-weight: bold;
    font-size: 1.25rem;
  }
`;

const StyledContainer = styled.div`
  max-width: 640px;
  margin: auto;
  border: 1px solid #00000025;
  border-radius: 3px;
  box-shadow: 0 2px 10px #0000002a;

  .name {
    display: block;
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .shadow {
    box-shadow: 0 2px 5px #00000048;
  }

  .headers {
    display: flex;
    justify-content: space-between;
    padding: 1rem 2rem;
    padding-left: 3rem;
    transition: box-shadow 250ms;

    * {
      font-weight: bold;
    }
  }

  a {
    display: flex;
    justify-content: space-between;
    padding: 1rem 1rem;
    max-width: 100%;
    border-radius: 5px;
    background-color: transparent;
    transition: background-color 250ms;
    border-bottom: 1px solid #00000016;

    &:hover {
      background-color: #00000049;
    }
  }

  ul {
    padding: 1rem 2rem;
    margin: unset;
    list-style: none;
    max-height: 60vh;
    overflow-y: auto;
    margin-bottom: 2rem;
  }
`;

export default function ProviderList() {
  const listRef = useRef<HTMLUListElement>(null);
  const [datas, setDatas] = useState<
    {
      id: string;
      name: string;
      min: number;
    }[]
  >([]);

  const [search, setSearch] = useState("");
  const providers = useMemo(
    () =>
      datas.filter((provider) => {
        const a = provider.name.toLowerCase();
        const b = search.toLowerCase();
        return a.includes(b) || b.includes(a);
      }),
    [search, datas]
  );

  useEffect(() => {
    api
      .get("/provider")
      .then((res) => {
        const datas: {
          id: string;
          name: string;
          min: number;
        }[] = res.data;

        setDatas(
          datas
            .map((provider: { id: string; name: string; min: number }) => ({
              id: provider.id,
              name: provider.name,
              min: provider.min,
            }))
            .sort((a, b) => (a.name < b.name ? -1 : 1))
        );
      })
      .catch((err) => console.error(err));
    setupListHeaderShadowStyle();
  }, []);

  const setupListHeaderShadowStyle = () => {
    const list = listRef.current;
    if (list) {
      list.addEventListener("scroll", () => {
        const headers = document.querySelector(".headers");
        if (headers) {
          headers.classList.toggle("shadow", list.scrollTop >= 10);
        }
      });
    }
  };

  return (
    <StyledContainer>
      <StyledHeader>
        <p>
          <label htmlFor="searchbar">Choisisser un fournisseur</label>
        </p>
        <input
          type="text"
          placeholder="Rechercher"
          name="searchbar"
          id="searchbar"
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
          }}
        />
      </StyledHeader>
      <div className="headers">
        <span>Nom</span>
        <span>Achat minimum</span>
      </div>
      <ul ref={listRef}>
        {providers.map((provider, i) => (
          <li key={i}>
            <Link to={provider.id}>
              <span className="name">{provider.name}</span>
              <span>{provider.min}</span>
            </Link>
          </li>
        ))}
      </ul>
    </StyledContainer>
  );
}
