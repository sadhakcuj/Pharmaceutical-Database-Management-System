import { useEffect, useState } from "react";
import { appearFromLeft } from "../styles/animations";
import styled from "styled-components";

const StyledHeader = styled.header<{ $shadow: boolean }>`
  box-shadow: ${({ $shadow }) => ($shadow ? "0 1px 10px #0000004b;" : "unset")};
  transition: box-shadow 250ms;
  padding: 1rem 2rem;
  margin-bottom: 1rem;
  background: white;
  position: sticky;
  z-index: 2;
  top: 0;

  h1 {
    margin: 0;
    animation: ${appearFromLeft} 500ms both;
  }
`;

export default function Header({
  children,
  headerTitle,
  className,
}: {
  children?: React.ReactNode;
  headerTitle: string;
  className?: string;
}) {
  const [shadow, setShadow] = useState(false);

  useEffect(() => {
    const container = document.querySelector(".right");
    if (container) {
      container.addEventListener("scroll", () => {
        setShadow(container.scrollTop >= 10);
      });
    }
  }, []);

  return (
    <StyledHeader $shadow={shadow} className={className}>
      <h1>{headerTitle}</h1>
      {children}
    </StyledHeader>
  );
}
