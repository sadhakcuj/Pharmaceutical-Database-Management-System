export type Medicine = {
  id: string;
  name: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number; // stock à terme
  location: string;
  dci?: string;
  isTaxed: boolean;
  min: number;
  max: number;
  expirationDate?: string;
  alert: number;
  family: string;
  manufacturationDate?: string;
  nomenclature?: string;
  real: number; // stock réel
  reference: string;
  type: string;
};

export type MedicineDto = {
  name: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  location: string;
  dci?: string;
  isTaxed: boolean;
  min: number;
  max: number;
  expirationDate?: string;
};

export type MedicineFromProvider = {
  id: string;
  name: string;
  priceWithoutTax: number;
  priceWithTax: number;
  quantity: number;
  dci?: string;
  providerId: string;
  expirationDate: string;
  matchingMedicines: Medicine[];
};

export type Provider = {
  id: string;
  name: string;
  medicines: MedicineFromProvider[];
  min: number;
};

export type ProviderDto = {
  accountNumber: string;
  abridgment: string;
  commonAccountNumber: string;
  address: string;
  complementAdress?: string;
  postalCode?: number;
  city: string;
  country: string;
  telephone: string[];
  telecopie?: string;
  email?: string;
  contactName?: string;
  rc?: string;
  stat?: string;
  nif?: string;
  cif?: string;
  collector: string;
  name: string;
  min: number;
};

export type ArchivedOrder = {
  id: string;
  createdAt: string;
  providerName: string;
  orderCreationDate: string;
  receipts: Receipt[];
};

export type ArchivedOrderDto = {
  createdAt: string;
  providerName: string;
  orderCreationDate: string;
  receipts: string[];
};

export type Receipt = {
  id: string;
  filename: string;
  orderId: string;
  archivedOrderId: string;
};
