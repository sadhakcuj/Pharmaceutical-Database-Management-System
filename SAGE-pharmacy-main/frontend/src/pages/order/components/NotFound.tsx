import styled from "styled-components";

const StyledTitle = styled.h1`
  margin: 5rem 0;
  text-align: center;
`;

export default function NotFound() {
  return <StyledTitle>Erreur lors de la création de la commande</StyledTitle>;
}
