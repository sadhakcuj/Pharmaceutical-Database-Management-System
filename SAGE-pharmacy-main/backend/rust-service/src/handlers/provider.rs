use crate::services::provider::MedicineMapRecord;
use crate::services::{provider::ProviderService, stock::StockService};
use crate::AppState;
use actix_web::{get, web, HttpResponse, Responder};
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all="camelCase")]
struct MedicineMatchingRecord {
    /// Name of medicine from stock
    name: String,
    stock_min: i32,
    provider_medicines: Vec<MedicineMapRecord>,
}

/// Check medicines with near low quantity and find matching from providers
#[get("provider/provide")]
pub async fn provide_medicines_for_near_low(app_state: web::Data<AppState>) -> impl Responder {
    let db = &app_state.db_pool;
    let stock_service = StockService::new(db);
    let provider_service = ProviderService::new(db, &stock_service);

    let medicine_ids: Vec<String> = stock_service
        .get_near_low_medicines()
        .await
        .iter()
        .map(|record| record.id.clone())
        .collect();

    let matching_medicines = provider_service
        .get_matching_medicines_for_list(medicine_ids)
        .await;

    let mut matches: Vec<MedicineMatchingRecord> = vec![];
    for (id, provider_medicines) in matching_medicines.iter() {
        if let Ok(medicine) = stock_service.get_medicine(id).await {
            matches.push(MedicineMatchingRecord {
                name: medicine.name,
                stock_min: medicine.min,
                provider_medicines: provider_medicines.clone(),
            });
        }
    }

    matches.sort_by(|a, b| a.name.cmp(&b.name));
    
    HttpResponse::Ok().json(matches)
}
