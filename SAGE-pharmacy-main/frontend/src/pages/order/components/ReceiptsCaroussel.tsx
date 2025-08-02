import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import styled, { keyframes } from "styled-components";
import { GrLinkPrevious, GrLinkNext } from "react-icons/gr";
import { FaDownload } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { api } from "../../../api";
import { useNotification } from "../../../hooks";
import { darken } from "polished";

type Props = {
  receiptIds: string[];
  onClose: () => void;
};

const pulse = keyframes`
0% {
	background: transparent;
}
50% {
	background: #ffffff18;
}
75% {
	background: #ffffff1f;
}
100% {
	background: #ffffff2f;
}
`;

const StyledBackground = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #00000045;
  backdrop-filter: blur(1px);
  z-index: 2;
`;

const StyledCloseButton = styled.button`
  all: unset;
  position: absolute;
  z-index: 5;
  top: 1rem;
  right: 1rem;
  cursor: pointer;
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: grid;
  place-items: center;
  border-radius: 3rem;
  animation: ${pulse} linear 1s infinite alternate;
  transition: background 300ms;

  * {
    fill: #3a3a3a;
  }

  &:hover {
    background: #ffffff83;
  }
`;

const StyledImage = styled.div<{ $image: string }>`
  background: url(${({ $image }) => $image});
  width: 70vw;
  height: 100vh;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const StyledButton = styled.button`
  all: unset;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 4;
  font-size: 4rem;
  width: 15vw;
  text-align: center;
  cursor: pointer;
  background: #ffffff0b;
  transition: background 500ms;
  backdrop-filter: blur(1px);

  &:hover {
    background: #ffffff20;
  }

  &.prev {
    left: 0;
  }

  &.next {
    right: 0;
  }
`;

const StyledDownloadButton = styled.div`
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  div {
    color: white;
    font-size: 1.5rem;
  }

  button {
    all: unset;
    width: 160px;
    display: block;
    margin: 1rem auto 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    padding: 0.5rem 0;
    cursor: pointer;
    border-radius: 2px;
    border: 1px solid #0000002b;
    background: ${({ theme }) => theme.colors.secondary};
    transition: background 250ms;

    &:hover {
      background: ${({ theme }) => darken(0.125, theme.colors.secondary)};
    }

    * {
      color: white;
    }
  }
`;

export default function ReceiptsCaroussel({ onClose, receiptIds: ids }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { pushNotification } = useNotification();
  const [image, setImage] = useState("");

  const nextImage = () => setCurrentIndex((i) => (i + 1) % ids.length);
  const previousImage = () =>
    setCurrentIndex((i) => (i == 0 ? ids.length - 1 : (i - 1) % ids.length));

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextImage();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        previousImage();
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  useEffect(() => {
    const getImage = async () => {
      let res = await api.get(`/receipt/${ids[currentIndex]}/type`);
      const type: string = res.data.type;

      if (type != "pdf") {
        const res = await api.get(`/receipt/${ids[currentIndex]}`, {
          responseType: "blob",
        });
        setImage(URL.createObjectURL(res.data));
      } else {
        setImage("");
      }
    };

    getImage().catch((err) => {
      console.error(err);
      pushNotification("Impossible de charger l'image");
    });
  }, [currentIndex]);

  const container = document.querySelector("#portal");
  if (!container) {
    return null;
  }

  const downloadButtonOnClick = () => {
    api
      .get(`/receipt/${ids[currentIndex]}`, {
        responseType: "blob",
      })
      .then((res) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(res.data);

        const now = new Date();
        a.download = now.toISOString() + ".pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((e) => {
        console.error(e);
        pushNotification("Une erreur s'est produite lors du téléchargement");
      });
  };

  return createPortal(
    <>
      <StyledBackground />
      <StyledCloseButton onClick={onClose}>
        <IoClose />
      </StyledCloseButton>
      <StyledButton className="prev" onClick={previousImage}>
        <GrLinkPrevious />
      </StyledButton>
      {image ? (
        <StyledImage $image={image} />
      ) : (
        <StyledDownloadButton>
          <div>Aucun aperçu disponible</div>
          <button onClick={downloadButtonOnClick}>
            <span>Télécharger</span>
            <FaDownload />
          </button>
        </StyledDownloadButton>
      )}
      <StyledButton className="next" onClick={nextImage}>
        <GrLinkNext />
      </StyledButton>
    </>,
    container
  );
}
