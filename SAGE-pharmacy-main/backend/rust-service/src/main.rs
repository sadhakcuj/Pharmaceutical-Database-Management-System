mod handlers;
mod models;
mod services;

use actix_cors::Cors;
use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use dotenvy::dotenv;
use handlers::provider;

pub struct AppState {
    pub db_pool: sqlx::PgPool,
}

#[get("/")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("Server healthy ❤️")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().expect(".env file not found");
    let port = String::from("8080");

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let db_pool = sqlx::PgPool::connect(&db_url)
        .await
        .expect("Unable to connect to database");

    let is_prod: bool = std::env::var("PRODUCTION")
        .unwrap_or("false".to_owned())
        .parse()
        .unwrap();

    println!("🚀 Server running on port {port}");
    HttpServer::new(move || {
        let cors = Cors::default().allow_any_origin().allow_any_method();
        App::new()
            .wrap(cors)
            .app_data(web::Data::new(AppState {
                db_pool: db_pool.clone(),
            }))
            .service(health_check)
            .service(provider::provide_medicines_for_near_low)
    })
    .bind((
        if is_prod { "0.0.0.0" } else { "127.0.0.1" },
        port.parse().unwrap(),
    ))?
    .run()
    .await
}
