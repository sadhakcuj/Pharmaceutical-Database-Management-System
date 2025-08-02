use serde::Serialize;

#[derive(Debug, sqlx::FromRow)]
#[sqlx(rename_all = "camelCase")]
pub struct Medicine {
    pub id: String,
    pub name: String,
    pub cost_price: i32,
    pub selling_price: i32,
    pub quantity: i32,
    pub real: i32,
    pub nomenclature: Option<String>,
    pub location: String,
    pub dci: Option<String>,
    pub family: String,
    pub is_taxed: bool,
    pub min: i32,
    pub max: i32,
    pub alert: i32,
    pub reference: String,
    pub expiration_date: Option<chrono::NaiveDate>,
    pub manufacturation_date: Option<chrono::NaiveDate>,

    #[sqlx(rename = "type")]
    pub medicine_type: String,
}

#[derive(sqlx::FromRow)]
#[sqlx(rename_all = "camelCase")]
pub struct Provider {
    pub id: String,
    pub account_number: String,
    pub abridgment: String,
    pub common_account_number: String,
    pub address: String,
    pub complement_adress: Option<String>,
    pub postal_code: Option<i32>,
    pub city: String,
    pub country: String,
    pub telephone: Vec<String>,
    pub telecopie: Option<String>,
    pub email: Option<String>,
    pub contact_name: Option<String>,
    pub rc: Option<String>,
    pub stat: Option<String>,
    pub nif: Option<String>,
    pub cif: Option<String>,
    pub collector: String,
    pub name: String,
    pub min: Option<i32>,
    pub min_quantity: Option<i32>,
}

#[derive(Serialize, sqlx::FromRow, Clone)]
#[serde(rename_all = "camelCase")]
#[sqlx(rename_all = "camelCase")]
pub struct MedicineFromProvider {
    pub id: String,
    pub name: String,
    pub price_with_tax: i32,
    pub price_without_tax: i32,
    pub quantity: i32,
    pub dci: Option<String>,
    pub provider_id: String,
    pub expiration_date: chrono::NaiveDate,
}

/// Used for many-to-many relation
#[derive(sqlx::FromRow)]
pub struct MedicineToMedicineFromProviderRecord {
    #[sqlx(rename = "A")]
    pub medicine_id: String,

    #[sqlx(rename = "B")]
    pub medicine_from_provider_id: String,
}
