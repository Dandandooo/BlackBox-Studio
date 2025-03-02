
use std::{path::{Path, PathBuf}, sync::Mutex};
use actix_cors::Cors;

use backend::Graph;
use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use serde::Deserialize;


struct AppState {
    graph: Mutex<Graph>
}

#[get("/api")]
async fn serve() -> impl Responder {
    HttpResponse::Ok().body("Hello from Rust Backend!")
}

#[derive(Deserialize)]
struct QueryParams {
    meta_dir: String,
}

#[get("/api/add-node")]
async fn add_node(state: web::Data<AppState>, query: web::Query<QueryParams>) -> impl Responder {
    let meta_dir = &query.meta_dir;

    let mut graph = state.graph.lock().unwrap();
    let id = graph.add_node_from_file(&Path::new(&meta_dir));
    
    match id {
        Ok(id) => HttpResponse::Ok()
                    .content_type("application/json")
                    .json(&graph.nodes[id]),
        Err(e) => HttpResponse::BadRequest().body(e.to_string())
    }
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {

    let state = web::Data::new(AppState {
        graph: Mutex::new(Graph::new()),
    });

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin() // Allows requests from any origin
            .allow_any_method() // Allows any HTTP method (GET, POST, etc.)
            .allow_any_header() // Allows any headers
            .max_age(3600); // Cache preflight response for 1 hour

        App::new()
            .app_data(state.clone())
            .wrap(cors)
            .service(serve)
            .service(add_node)
    })
    .bind(("localhost", 8000))?
    .run()
    .await
}
