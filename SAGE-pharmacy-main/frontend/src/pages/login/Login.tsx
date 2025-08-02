import { lighten } from "polished";
import styled, { keyframes } from "styled-components";
import { appear, appearFromLeft } from "../../styles/animations";
import { useState } from "react";
import { api } from "../../api";
import { useNavigate } from "react-router-dom";
import { BiSolidLockOpen } from "react-icons/bi";
import { AiOutlineLoading } from "react-icons/ai";

const StyledContainer = styled.div`
  display: grid;
  place-items: center;
  width: 100vw;
  height: 100vh;
  background: url(/images/login-bg.png);
  background-size: cover;
  background-repeat: no-repeat;
`;

const rotate = keyframes`
from {
  transform: rotate(0);
} to {
  transform: rotate(360deg);
}
`;

const StyledForm = styled.form`
  width: 100%;
  max-width: ${({ theme }) => theme.sizes.login.width};
  box-shadow: 0 1px 5px #0000004a;
  animation: ${appear} 1s both;

  .error {
    all: unset;
    display: block;
    margin-bottom: 1rem;
    color: red;
    animation: ${appearFromLeft} 500ms both;
  }

  span {
    color: red;
  }

  header {
    background: ${({ theme }) => theme.colors.primary};
    border-bottom: 1px solid #00000020;
    padding: 1rem;

    * {
      text-align: center;
    }
  }

  & > div {
    background: white;
  }

  .button {
    padding-top: 0.5rem;
    display: flex;
    justify-content: center;
  }

  main {
    padding: 2rem 0 1rem;
    max-width: 360px;
    margin: auto;

    & > div {
      margin-bottom: 1.5rem;

      div {
        margin-bottom: 1rem;
      }
    }
  }

  input {
    width: 95%;
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  label {
    font-size: 1.125rem;
  }

  p {
    font-weight: bold;
  }
`;

const StyledButton = styled.button`
  all: unset;
  background: ${({ theme }) => theme.colors.quaternary};
  transition: background 250ms;
  color: white;
  padding: 1rem 2rem;
  cursor: pointer;
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:disabled {
    background: ${({ theme }) => lighten(0.5, theme.colors.quaternary)};
  }

  & > svg {
    fill: white;
    font-size: 1.25rem;
  }

  .spinner {
    font-size: 1.25rem;
    animation: ${rotate} ease-out infinite 750ms;

    svg {
      fill: white;
    }
  }

  span {
    color: white;
  }

  &:hover {
    background: ${({ theme }) => lighten(0.25, theme.colors.quaternary)};
  }
`;

export default function Login() {
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const formOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setPending(true);
    e.preventDefault();

    const form = e.currentTarget;
    api
      .post("/auth/signin", {
        name: form.username.value,
        password: form.password.value,
      })
      .then((res) => {
        const { accessToken, refreshToken } = res.data;
        localStorage.setItem("access-token", accessToken);
        localStorage.setItem("refresh-token", refreshToken);
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setPending(false));
  };

  return (
    <StyledContainer>
      <StyledForm onSubmit={formOnSubmit}>
        <header>
          <div>
            <img src="/images/logo.png" alt="logo" />
          </div>
          <p>Connectez-vous à l'ERP pour continuer</p>
        </header>
        <div>
          <main>
            <div>
              <div>
                <label htmlFor="username">
                  Nom d'utilisateur<span>*</span>
                </label>
              </div>
              <div>
                <input
                  onChange={() => setError(false)}
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Votre nom..."
                  required
                />
              </div>
            </div>
            <div>
              <div>
                <label htmlFor="password">
                  Mot de passe<span>*</span>
                </label>
              </div>
              <div>
                <input
                  onChange={() => setError(false)}
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Votre mot de passe..."
                  required
                />
              </div>
            </div>
            {error && (
              <p className="error">
                Nom d'utilisateur ou mot de passe invalide
              </p>
            )}
            <div className="button">
              <StyledButton>
                <BiSolidLockOpen />
                <span>Se Connecter</span>
                {pending && (
                  <span className="spinner">
                    <AiOutlineLoading />
                  </span>
                )}
              </StyledButton>
            </div>
          </main>
        </div>
      </StyledForm>
    </StyledContainer>
  );
}
