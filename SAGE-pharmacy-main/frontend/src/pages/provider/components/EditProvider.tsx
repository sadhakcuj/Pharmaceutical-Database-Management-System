import { lighten } from "polished";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../../api";
import { useNotification } from "../../../hooks";
import { ProviderDto } from "../../../models";

const StyledCreateProvider = styled.form`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    display: flex;
    gap: 0.25rem;

    span {
      color: red;
    }
  }

  input {
    width: 100%;
    padding: 8px;
    margin-bottom: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.tertiary};
    }
  }

  button {
    background-color: ${({ theme }) => theme.colors.tertiary};
    color: #fff;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;

    &:hover {
      background-color: ${({ theme }) => lighten(0.1, theme.colors.tertiary)};
    }
  }
`;

function EditProvider() {
  const { pushNotification } = useNotification();
  const navigate = useNavigate();
  const { id: providerId } = useParams();
  const [provider, setProvider] = useState<ProviderDto | null>(null);

  const editProvider = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const editedProvider: ProviderDto = {
      accountNumber: formData.get("account-number")?.toString(),
      abridgment: formData.get("abridgment")?.toString(),
      commonAccountNumber: formData.get("common-account-number")
        ? formData.get("common-account-number").toString()
        : "",
      address: formData.get("address")?.toString(),
      city: formData.get("city")?.toString(),
      country: formData.get("country")?.toString(),
      telephone: [formData.get("telephone")?.toString()?.toString()],
      collector: formData.get("collector")?.toString(),
      name: formData.get("name")?.toString(),
      min: isNaN(parseInt(formData.get("min").toString()))
        ? 1
        : parseInt(formData.get("min")?.toString()),
      cif: formData.get("cif")?.toString(),
      complementAdress: formData.get("complement-address")?.toString(),
      contactName: formData.get("contact-name")?.toString(),
      email: formData.get("email")?.toString(),
      nif: formData.get("nif")?.toString(),
      postalCode: isNaN(parseInt(formData.get("postal-code").toString()))
        ? undefined
        : parseInt(formData.get("postal-code").toString()),
      rc: formData.get("rc")?.toString(),
      stat: formData.get("stat")?.toString(),
      telecopie: formData.get("telecopie")?.toString(),
    };

    api
      .patch("/provider", {
        providerId: providerId,
        data: editedProvider,
      })
      .then((res) => {
        pushNotification("Fournisseur modifié");
        navigate("/provider/" + res.data.id);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    api
      .get("/provider/" + providerId)
      .then((res) => setProvider(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <StyledCreateProvider onSubmit={editProvider}>
      <h2>Nouveau Fournisseur</h2>
      <label htmlFor="name">
        Désignation<span>*</span>
      </label>
      <input
        required
        type="text"
        name="name"
        id="name"
        defaultValue={provider?.name}
      />
      <label htmlFor="account-number">
        Numéro de compte<span>*</span>
      </label>
      <input
        required
        type="text"
        name="account-number"
        id="account-number"
        defaultValue={provider?.accountNumber}
      />
      <label htmlFor="abridgment">
        Abrégé<span>*</span>
      </label>
      <input
        required
        type="text"
        name="abridgment"
        id="abridgment"
        defaultValue={provider?.abridgment}
      />
      <label htmlFor="common-account-number">
        Numéro de compte collectif<span>*</span>
      </label>
      <input
        required
        type="text"
        name="common-account-number"
        id="common-account-number"
        defaultValue={provider?.commonAccountNumber}
      />
      <label htmlFor="address">
        Adresse<span>*</span>
      </label>
      <input
        required
        type="text"
        name="address"
        id="address"
        defaultValue={provider?.address}
      />
      <label htmlFor="complement-address">Complément d'adresse</label>
      <input
        type="text"
        name="complement-address"
        id="complement-address"
        defaultValue={provider?.complementAdress}
      />
      <label htmlFor="postal-code">Code postal</label>
      <input
        type="text"
        name="postal-code"
        id="postal-code"
        defaultValue={provider?.postalCode}
      />
      <label htmlFor="city">
        Ville<span>*</span>
      </label>
      <input
        required
        type="text"
        name="city"
        id="city"
        defaultValue={provider?.city}
      />
      <label htmlFor="country">
        Pays<span>*</span>
      </label>
      <input
        required
        type="text"
        name="country"
        id="country"
        defaultValue={provider?.country}
      />
      <label htmlFor="telephone">
        Téléphone<span>*</span>
      </label>
      <input
        required
        type="text"
        name="telephone"
        id="telephone"
        defaultValue={provider?.telephone}
      />
      <label htmlFor="telecopie">Télécopie</label>
      <input
        type="text"
        name="telecopie"
        id="telecopie"
        defaultValue={provider?.telecopie}
      />
      <label htmlFor="email">Email</label>
      <input
        type="text"
        name="email"
        id="email"
        defaultValue={provider?.email}
      />
      <label htmlFor="contact-name">Nom de contact</label>
      <input
        type="text"
        name="contact-name"
        id="contact-name"
        defaultValue={provider?.contactName}
      />
      <label htmlFor="rc">RC</label>
      <input type="text" name="rc" id="rc" defaultValue={provider?.rc} />
      <label htmlFor="nif">NIF</label>
      <input type="text" name="nif" id="nif" defaultValue={provider?.nif} />
      <label htmlFor="stat">STAT</label>
      <input type="text" name="stat" id="stat" defaultValue={provider?.stat} />
      <label htmlFor="cif">CIF</label>
      <input type="text" name="cif" id="cif" defaultValue={provider?.cif} />
      <label htmlFor="collector">
        Collecteur<span>*</span>
      </label>
      <input
        required
        type="text"
        name="collector"
        id="collector"
        defaultValue={provider?.collector}
      />
      <label htmlFor="min">Achat Min</label>
      <input type="text" name="min" id="min" defaultValue={provider?.min} />
      <button type="submit">Mettre à jour</button>
    </StyledCreateProvider>
  );
}

export default EditProvider;
