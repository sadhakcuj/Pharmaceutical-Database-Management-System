import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';
import * as fs from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  // Clear remaining datas
  await prisma.orderMedicine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.medicineFromProvider.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating mock users');
  await createMockUser();

  console.log('Filling stock');
  await fillStock();

  console.log('Creating providers');
  await createProviders();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

function randInt() {
  return Math.round(1 + 19 * Math.random());
}

type Provider = {
  accountNumber: string;
  abridgment: string;
  commonAccountNumber: number;
  address: string;
  postalCode?: number;
  city: string;
  country: string;
  telephone: string[];
  contactName?: string;
  stat?: string;
  nif?: string;
  collector: string;
  name: string;
};

type Medicine = {
  type: string;
  reference: string;
  real?: string;
  name: string;
  sellingPrice: string;
  quantity?: string;
  family: string;
  dci?: string;
  nomenclature?: string;
};

type Location = {
  reference: string;
  costPrice: string;
  location: string;
  manufacturationDate?: string;
  expirationDate?: string;
};

async function fillStock() {
  const {
    medicines,
    locations,
  }: {
    medicines: Medicine[];
    locations: Location[];
  } = JSON.parse(fs.readFileSync(join(__dirname, 'datas.json'), 'utf-8'));

  const createRecord = async (record: Medicine) => {
    const medicine = {
      ...record,
      quantity: record.quantity ? parseInt(record.quantity) : 0,
      real: record.real ? parseInt(record.real) : 0,
      sellingPrice: parseInt(record.sellingPrice),
    };

    const location = locations.find(
      (location) => location.reference === medicine.reference,
    );
    if (location) {
      let min = randInt(),
        max = randInt();

      if (min == 20) {
        min = 10;
        max = 20;
      } else {
        while (max <= min) {
          max = randInt();
        }
      }

      let alert = Math.round(min + (max - min) / 4);
      if (alert < min) {
        alert = min;
      }

      await prisma.medicine.create({
        data: {
          ...medicine,
          costPrice: parseInt(location.costPrice),
          location: location.location,
          manufacturationDate: location.manufacturationDate
            ? new Date(location.manufacturationDate).toISOString()
            : undefined,
          expirationDate: location.expirationDate
            ? new Date(location.expirationDate).toISOString()
            : undefined,
          alert,
          min,
          max,
        },
      });
    }
  };

  if (process.env.NODE_ENV == 'production') {
    for (let record of medicines) {
      await createRecord(record);
    }
  } else {
    await Promise.all(medicines.map((record) => createRecord(record)));
  }
}

async function createMockUser() {
  const hashed = await argon.hash('free');

  const user = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashed,
      role: 'ADMIN',
    },
  });
  return user;
}

async function createProviders() {
  const {
    providers,
  }: {
    providers: Provider[];
  } = JSON.parse(fs.readFileSync(join(__dirname, 'datas.json'), 'utf-8'));

  const medicineNames = (
    await prisma.medicine.findMany({
      select: {
        name: true,
      },
    })
  ).map(({ name }) => name);

  for (let i = 0; i < providers.length; i++) {
    const currentProvider: Provider = providers[i];
    const minAddOn =
      Math.random() < 0.5
        ? {
            min: Math.floor(Math.random() * 80001) + 20000, // Random min value between [20.000 - 100.000],
          }
        : {
            minQuantity: Math.floor(Math.random() * 11), // Random minQuantity value between [0 - 10]
          };
    const provider = await prisma.provider.create({
      data: {
        ...currentProvider,
        commonAccountNumber: currentProvider.commonAccountNumber.toString(),
        ...minAddOn,
      },
    });

    const uniqueMedicineNames = new Set();

    for (let j = 0; j < 20; j++) {
      let randomMedicineName;

      do {
        randomMedicineName =
          medicineNames[Math.floor(Math.random() * medicineNames.length)];
      } while (uniqueMedicineNames.has(randomMedicineName));

      uniqueMedicineNames.add(randomMedicineName);

      const records = await prisma.medicine.findMany({
        where: {
          name: randomMedicineName,
        },
      });
      const priceWithoutTax = 100 * Math.round(Math.random() * 100);

      let priceWithTax;
      do {
        priceWithTax = 100 * Math.round(Math.random() * 100);
      } while (priceWithTax < priceWithoutTax);

      for (let record of records) {
        await prisma.medicineFromProvider.create({
          data: {
            name: randomMedicineName,
            priceWithoutTax,
            priceWithTax,
            quantity: Math.floor(Math.random() * 100) + 1,
            dci: record.dci,
            expirationDate: new Date(
              Date.now() + Math.random() * (365 * 24 * 60 * 60 * 1000),
            ),
            providerId: provider.id,
            matchingMedicines: {
              connect: [
                {
                  id: record.id,
                },
              ],
            },
          },
        });
      }
    }
  }
}
