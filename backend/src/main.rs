
use std::{path::{Path, PathBuf}, sync::Mutex};
use actix_cors::Cors;

use backend::Graph;
use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use serde::Deserialize;
use serde_json::{Value,json};


struct AppState {
    graph: Mutex<Graph>
}

fn serialize_propagation(graph: &Graph, vals: Vec<usize>) -> Value{
    let mut list = vals.iter()
                        .filter_map(|id| graph.nodes[*id])
                        .map(|node| json!({
                            "inputs":  node.inputs.iter().map(|i| if let Some(s) = i.value {s} else {"{}".to_string()}).collect(),
                            "outputs": node.outputs.iter().map(|i| if let Some(s) = i.value {s} else {"{}".to_string()}).collect(),
                        })).collect();
    Value::Array(list)
}

#[get("/api")]
async fn serve() -> impl Responder {
    HttpResponse::Ok().body("Hello from Rust Backend!")
}

#[derive(Deserialize)]
struct AddNodeParams {
    meta_path: String,
}

#[get("/api/add-node")]
async fn add_node(state: web::Data<AppState>, query: web::Query<AddNodeParams>) -> impl Responder {
    let meta_path = &query.meta_path;

    let mut graph = state.graph.lock().unwrap();
    let id = graph.add_node_from_file(&Path::new(&meta_path));
    
    match id {
        Ok(id) => HttpResponse::Ok()
                    .content_type("application/json")
                    .json(&graph.nodes[id]),
        Err(e) => HttpResponse::BadRequest().body(e.to_string())
    }
}

#[derive(Deserialize)]
struct ConnectionParams {
    id_a: usize,
    id_b: usize,
    port_a: usize,
    port_b: usize
}

#[get("/api/add-connection")]
async fn add_connection(state: web::Data<AppState>, query: web::Query<ConnectionParams>) -> impl Responder {

    let mut graph = state.graph.lock().unwrap();
    let prop = graph.connect(query.id_a, query.port_a, query.id_b, query.port_b);
    
    match prop {
        Ok(prop) => HttpResponse::Ok()
                    .content_type("application/json")
                    .json(serialize_propagation(&graph, prop)),
        Err(e) => HttpResponse::BadRequest().body(e.to_string())
    }
}

#[get("/api/remove-connection")]
async fn remove_connection(state: web::Data<AppState>, query: web::Query<ConnectionParams>) -> impl Responder {

    let mut graph = state.graph.lock().unwrap();
    let prop = graph.disconnect(query.id_a, query.port_a, query.id_b, query.port_b);
    
    match prop {
        Ok(prop) => HttpResponse::Ok()
                    .content_type("application/json")
                    .json(serialize_propagation(&graph, prop)),
        Err(e) => HttpResponse::BadRequest().body(e.to_string())
    }
}

#[derive(Deserialize)]
struct NodeRemoveParams {
    id: usize
}

#[get("/api/remove-node")]
async fn remove_node(state: web::Data<AppState>, query: web::Query<NodeRemoveParams>) -> impl Responder {

    let mut graph = state.graph.lock().unwrap();
    let prop = graph.remove_node(query.id);
    
    match prop {
        Ok(prop) => HttpResponse::Ok()
                    .content_type("application/json")
                    .json(serialize_propagation(&graph, prop)),
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
            .service(add_connection)
    })
    .bind(("localhost", 8000))?
    .run()
    .await
}
