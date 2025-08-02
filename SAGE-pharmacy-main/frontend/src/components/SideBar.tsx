import { lighten } from "polished";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import paths from "../paths";
import { useEffect, useState } from "react";
import { api } from "../api";
import { Provider } from "../models";
import { IoIosArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { IoAddCircleOutline } from "react-icons/io5";
import React from "react";

const StyledSideBar = styled.div`
  max-width: 280px;
  background-color: ${({ theme }) => theme.colors.secondary};

  .active {
    position: relative;

    &::before {
      transform: scaleX(1);
      transition: transform 500ms;
    }

    span {
      position: relative;
    }
  }

  .logo {
    display: flex;
    justify-content: center;
    padding: 1rem;

    img {
      width: 50%;
      height: 10%;
      padding-bottom: 1rem;
      border-bottom: solid 2px ${({ theme }) => theme.colors.quaternary};
    }
  }

  nav {
    ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      padding: 0;

      a {
        &::before {
          display: block;
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          transform-origin: left;
          transform: scaleX(0);
        }

        & > span {
          cursor: pointer;
          font-size: 1.25rem;
          padding: 10px 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;

          svg {
            &:nth-of-type(2) {
              position: absolute;
              right: 1rem;
              transform: rotate(0);
              transition: transform 250ms;

              &.unfolded {
                transform: rotate(180deg);
              }
            }
          }
        }
      }
    }

    li {
      overflow: hidden;
      max-height: 1000px;
      transition: max-height 0.25s ease;

      &.folded {
        max-height: 3rem;
      }

      &:hover {
        background-color: ${({ theme }) =>
          lighten(0.1, theme.colors.secondary)};
      }

      ul {
        transform-origin: top;
        transform: scaleY(1);
        transition: transform 0.25s ease;
        display: flex;

        &.folded {
          transform: scaleY(0);
        }

        li {
          padding: 10px;
          transition: background-color 0.1s;
          cursor: pointer;
          font-size: 15px;
          padding-left: 25%;
          display: flex;
          align-items: center;
          gap: 0.75rem;

          a {
            width: 100%;
            display: flex;
            justify-content: flex-start;
          }

          &:hover {
            background-color: ${({ theme }) =>
              lighten(0.15, theme.colors.secondary)};
          }
        }
      }
    }

    .add-btn {
      display: flex;
      align-items: center;
      text-align: start;
      padding-left: 0;

      svg {
        font-size: 20px;
      }
    }

    .list-container {
      max-height: 50vh;
      overflow-y: auto;

      &.folded {
        overflow-y: hidden;
      }
    }
  }
`;

export default function SideBar() {
  const location = useLocation();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [unfoldedProviderList, setUnfoldedProviderList] = useState(false);

  useEffect(() => {
    api
      .get("/provider")
      .then((res) => {
        const data: Provider[] = res.data;
        setProviders(data);
      })
      .catch((err) => {
        console.error("Error in SideBar.tsx line 88: " + err);
      });
  }, [location]);

  return (
    <StyledSideBar>
      <div className="logo">
        <img src="/images/logo.png" alt="Pharmacie Hasimbola" />
      </div>
      <nav>
        <ul>
          {paths.map((path, i) => (
            <React.Fragment key={i}>
              {path.to != "/provider" ? (
                <li key={i}>
                  <Link
                    to={path.to}
                    className={
                      location.pathname.includes(path.to) ? "active" : ""
                    }>
                    <span>
                      {path.icon}
                      {path.name}
                    </span>
                  </Link>
                </li>
              ) : (
                <li key={i} className={unfoldedProviderList ? "" : "folded"}>
                  <a
                    onClick={() =>
                      setUnfoldedProviderList(
                        (unfoldedProviderList) => !unfoldedProviderList
                      )
                    }>
                    <span>
                      {path.icon}
                      {path.name}
                      {providers.length > 0 ? (
                        <IoIosArrowDropdown
                          className={unfoldedProviderList ? "unfolded" : ""}
                        />
                      ) : null}
                    </span>
                  </a>
                  <div
                    className={`list-container ${
                      unfoldedProviderList ? "" : "folded"
                    }`}
                  >
                    <ul className={unfoldedProviderList ? "" : "folded"}>
                      {providers.map((provider, i) => (
                        <li key={i}>
                          <IoMdArrowDropright />
                          <Link
                            key={provider.name}
                            to={path.to + "/" + provider.id}
                          >
                            {provider.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="add-btn">
                    <Link to="/provider/create">
                      <span>Ajouter Fournisseur</span>
                    </Link>
                    <IoAddCircleOutline />
                  </div>
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </nav>
    </StyledSideBar>
  );
}
