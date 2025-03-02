
use backend::Graph;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};

#[get("/api")]
async fn serve() -> impl Responder {
    HttpResponse::Ok().body("Hello from Rust Backend!")
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(serve)
    })
    .bind(("localhost", 8000))?
    .run()
    .await
}
