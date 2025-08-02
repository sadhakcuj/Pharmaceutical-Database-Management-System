use super::stock::StockService;
use crate::models::{MedicineFromProvider, MedicineToMedicineFromProviderRecord, Provider};
use serde::Serialize;
use sqlx::PgPool;
use std::collections::HashMap;

pub struct ProviderService<'a> {
    db: &'a PgPool,
    stock_service: &'a StockService<'a>,
}

#[derive(Serialize, Clone)]
pub struct MedicineMapRecordProvider {
    pub name: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MedicineMapRecord {
    pub medicine: MedicineFromProvider,
    pub provider: MedicineMapRecordProvider,
    pub quantity_to_order: i32,
}

impl<'a> ProviderService<'a> {
    pub fn new(db_pool: &'a PgPool, stock_service: &'a StockService) -> Self {
        Self {
            db: db_pool,
            stock_service,
        }
    }

    pub async fn get_matching_medicines(
        &self,
        medicine_id: String,
    ) -> Result<Vec<MedicineFromProvider>, sqlx::Error> {
        // we make sure medicine record exists
        self.stock_service.get_medicine(&medicine_id).await?;

        let map: Vec<MedicineToMedicineFromProviderRecord> =
            sqlx::query_as(r#"SELECT * FROM "_MedicineToMedicineFromProvider" WHERE "A" = $1"#)
                .bind(&medicine_id)
                .fetch_all(self.db)
                .await?;

        let mut medicines_from_provider = vec![];
        for map_record in map {
            let medicine_from_provider: MedicineFromProvider =
                sqlx::query_as(r#"SELECT * FROM "MedicineFromProvider" WHERE "id" = $1"#)
                    .bind(&map_record.medicine_from_provider_id)
                    .fetch_one(self.db)
                    .await?;

            let order_count = sqlx::query!(
                r#"SELECT COUNT(*) FROM "OrderMedicine" WHERE "medicineFromProviderId" = $1"#,
                &medicine_from_provider.id
            )
            .fetch_one(self.db)
            .await?
            .count
            .unwrap_or(0);

            if order_count == 0 {
                medicines_from_provider.push(medicine_from_provider);
            }
        }

        Ok(medicines_from_provider)
    }

    async fn map_medicine_to_medicine_from_provider(
        &self,
        medicine_id: String,
        mapping: &mut HashMap<String, Vec<MedicineMapRecord>>,
    ) -> Result<(), sqlx::Error> {
        let medicines = self.get_matching_medicines(medicine_id.clone()).await?;
        if medicines.len() > 0 {
            let mut record: Vec<MedicineMapRecord> = vec![];
            for medicine in medicines {
                let provider: Provider =
                    sqlx::query_as(r#"SELECT * FROM "Provider" WHERE "id" = $1"#)
                        .bind(&medicine.provider_id)
                        .fetch_one(self.db)
                        .await?;

                let medicine_in_stock = self.stock_service.get_medicine(&medicine_id).await?;
                let number_of_medicines_to_order =
                    medicine_in_stock.max - medicine_in_stock.quantity;
                let medicine_quantity = medicine.quantity;

                record.push(MedicineMapRecord {
                    medicine,
                    provider: MedicineMapRecordProvider {
                        name: provider.name,
                    },
                    quantity_to_order: if medicine_quantity > number_of_medicines_to_order {
                        number_of_medicines_to_order
                    } else {
                        medicine_quantity
                    },
                });
            }

            mapping.insert(medicine_id, record);
        }

        Ok(())
    }

    pub async fn get_matching_medicines_for_list(
        &self,
        medicine_ids: Vec<String>,
    ) -> HashMap<String, Vec<MedicineMapRecord>> {
        let mut map = HashMap::new();
        for id in medicine_ids {
            let _ = self
                .map_medicine_to_medicine_from_provider(id.clone(), &mut map)
                .await;
        }

        return map;
    }
}
