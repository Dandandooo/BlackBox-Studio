
use backend::Graph;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use serde::Deserialize;

#[get("/api")]
async fn serve() -> impl Responder {
    HttpResponse::Ok().body("Hello from Rust Backend!")
}

#[derive(Deserialize)]
struct QueryParams {
    meta_path: String,
    filename: String,
}

#[get("/api/add_node")]
async fn add_node(query: web::Query<QueryParams>) -> impl Responder {
    let meta_path = &query.meta_path;
    let filename = &query.filename;

    
    HttpResponse::Ok().body(format!(
        "Received meta_path: {}, filename: {}",
        meta_path, filename
    ))
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(serve)
            .service(add_node)
    })
    .bind(("localhost", 8000))?
    .run()
    .await
}
