use actix_web::{web, App, HttpServer, Responder, HttpResponse};

async fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello from Rust Backend!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().route("/api/data", web::get().to(index)))
        .bind("127.0.0.1:8000")?
        .run()
        .await
}
