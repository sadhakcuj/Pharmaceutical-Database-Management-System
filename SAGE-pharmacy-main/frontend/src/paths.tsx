import { AiTwotoneContainer } from "react-icons/ai";
import { MdOutlineViewKanban } from "react-icons/md";
import { PiFactoryBold } from "react-icons/pi";
import { SlBasket } from "react-icons/sl";
import { RiBillLine } from "react-icons/ri";

const paths = [
  {
    to: "/stock",
    name: "Stock",
    icon: <AiTwotoneContainer />,
  },
  {
    to: "/purchase",
    name: "Achat",
    icon: <SlBasket />,
  },
  {
    to: "/order",
    name: "Commande",
    icon: <MdOutlineViewKanban />,
  },
  {
    to: "/provider",
    name: "Fournisseurs",
    icon: <PiFactoryBold />,
  },
  {
    to: "/archive",
    name: "Factures",
    icon: <RiBillLine />,
  },
];

export default paths;
