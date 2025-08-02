use sqlx::PgPool;

use crate::models::Medicine;

pub struct StockService<'a> {
    db: &'a PgPool,
}

impl<'a> StockService<'a> {
    pub fn new(db_pool: &'a PgPool) -> Self {
        Self { db: db_pool }
    }

    /// Get medicine that has quantity lower than its stock alert
    pub async fn get_near_low_medicines(&self) -> Vec<Medicine> {
        sqlx::query_as(r#"SELECT * FROM "Medicine" WHERE "quantity" <= "alert""#)
            .fetch_all(self.db)
            .await
            .unwrap()
    }

    pub async fn get_medicine(&self, id: &str) -> Result<Medicine, sqlx::Error> {
        sqlx::query_as(r#"SELECT * FROM "Medicine" WHERE "id" = $1"#)
            .bind(&id)
            .fetch_one(self.db)
            .await
    }
}
