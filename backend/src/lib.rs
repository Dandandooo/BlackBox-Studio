use std::error::Error;
use serde::{Serialize, Deserialize};
use std::path::{Path, PathBuf};
use std::collections::VecDeque;
use self::process::load_process;

pub mod process;

// TODO figure out what this type is supposed to be
pub type Behavior = Box<dyn Fn(&Vec<String>) -> Result<Vec<String>, String> + Send + Sync + 'static>;

#[derive(Debug, Eq, PartialEq, Deserialize, Serialize)]
enum BehaviorType {
    Process { path: PathBuf, language: Option<String> },
    Builtin { name: String },
}

#[derive(Debug, Eq, PartialEq, Deserialize, Serialize)]
enum DataType {
    FreeJson,                            // any arbitrary json object
    Json(Vec<(String, DataType)>),       // specific json object
    Array(Box<DataType>),
    String,
    Int,
    Float,
    Bool,
}


#[derive(Debug, Eq, PartialEq, Deserialize, Serialize)]
struct Port<T> {
    name: String,               // for pattern matching
    datatype: DataType,         // for type checking
    #[serde(skip_serializing)]
    endpoint: T,    // for propogation
    #[serde(skip_serializing)]
    value: Option<String>
}


#[derive(Serialize)]
pub struct Node {
    id: usize,          // identification
    name: String,       // display name
    inputs: Vec<Port<Option<(usize, usize)>>>,
    outputs: Vec<Port<Vec<(usize, usize)>>>,
    behavior_type: BehaviorType,
    #[serde(skip_serializing)]
    behavior: Behavior,    // TODO find signature
}

pub struct Graph {
    pub nodes: Vec<Option<Node>>,       // tombstoning list
    // stack that represents free nodes, look here first if we want to add another node, otherwise
    // just push to the end of nodes
    tombstones: Vec<usize>,
}

impl Graph {

    pub fn new() -> Self {
        Graph {nodes: vec![], tombstones: vec![]}
    }

    pub fn pop_node(&mut self, node_id: usize) -> Option<Node> {

        if let Some(_) = self.nodes[node_id] {
            let node = std::mem::replace(&mut self.nodes[node_id], None).unwrap();

            node.inputs.iter().map(|it| it.endpoint).flatten().for_each(|(endpoint, port)| {
                let outputs = &mut self.nodes[endpoint]
                                    .as_mut()
                                    .unwrap()
                                    .outputs;

                outputs.remove(outputs[port].endpoint.iter().position(|(ep, _)| *ep == node_id).unwrap());

            });

            node.outputs.iter().map(|it| &it.endpoint).flatten().for_each(|(endpoint, port)| {
                self.nodes[*endpoint].as_mut().unwrap().inputs[*port].value = None;
                self.nodes[*endpoint].as_mut().unwrap().inputs[*port].endpoint = None;
            });

            self.tombstones.push(node_id);          // notify graph that this id is free
            return std::mem::replace(&mut self.nodes[node_id], None);
        }

        None
    }

    pub fn remove_node(&mut self, node_id: usize) {
        let _ = self.pop_node(node_id);
    }

    fn add_node(
        &mut self, 
        name: String, 
        inputs: Vec<Port<Option<(usize,usize)>>>,
        outputs: Vec<Port<Vec<(usize, usize)>>>,
        behavior_type: BehaviorType, 
        behavior: Behavior
    ) -> usize {
        let id = if let Some(top) = self.tombstones.pop() {
            top
        } else { 
            self.nodes.push(None);
            self.nodes.len() - 1
        };

        self.nodes[id] = Some(Node {
            id,
            name,
            inputs,
            outputs,
            behavior_type,
            behavior
        });
        id
    }


    pub fn add_node_from_file(&mut self, file: &Path) -> Result<usize, Box<dyn Error>>{
        let process = load_process(file)?;
        Ok(self.add_node(
            process.name,
            process.input_names.into_iter().zip(process.input_types.into_iter()).map(|(name, datatype)| Port::<Option<(usize, usize)>> {
                name,
                datatype,
                endpoint: None,
                value: None,
            }).collect(),
            process.output_names.into_iter().zip(process.output_types.into_iter()).map(|(name, datatype)| Port::<Vec<(usize, usize)>> {
                name,
                datatype,
                endpoint: vec![],
                value: None,
            }).collect(),
            BehaviorType::Process { path: process.path, language: process.language},
            process.run
        ))
    }

    // will fail of a cycle is made
    pub fn connect(&mut self, id_a: usize, port_a: usize, id_b: usize, port_b: usize) -> Result<(), String> {
        if let None = self.nodes[id_a] {
            return Ok(());
        }
        if let None = self.nodes[id_b] {
            return Ok(());
        }

        let node_a = self.nodes[id_a].as_mut().unwrap();
        node_a.outputs[port_a].endpoint.push((id_b, port_b));
        let node_b = self.nodes[id_b].as_mut().unwrap();

        node_b.inputs[port_b].endpoint = Some((id_a, port_a));
        self.propogate(id_b);

        Ok(())
    }

    // will fail of a cycle is made
    pub fn disconnect(&mut self, id_a: usize, port_a: usize, id_b: usize, port_b: usize) -> Result<(), String> {
        if let None = self.nodes[id_a] {
            return Ok(());
        }
        if let None = self.nodes[id_b] {
            return Ok(());
        }

        let position = self.nodes[id_a]
                        .as_ref()
                        .unwrap()
                        .outputs[port_a]
                        .endpoint
                        .iter()
                        .position(|(id, port)| *id == id_b && *port == port_b).unwrap();

        self.nodes[id_a].as_mut().unwrap().outputs[port_a].endpoint.remove(position);
        self.nodes[id_b].as_mut().unwrap().inputs[port_b].endpoint = None;

        self.propogate(id_b);

        Ok(())
    }

    pub fn propogate(&mut self, node_id: usize) -> Result<Vec<usize>, String> {

        if let None = self.nodes[node_id] {
            return Ok(vec![]);
        }

        let mut q: VecDeque<usize> = VecDeque::new();
        let mut visited = vec![false; self.nodes.len()];
        q.reserve(self.nodes.len());

        q.push_back(node_id);
        visited[node_id] = true;

        while !q.is_empty() {
            let front = q.pop_front().unwrap();
            let mut outputs = std::mem::take(&mut self.nodes[front].as_mut().unwrap().outputs);
            let node = &self.nodes[front].as_ref().unwrap();

            match node.inputs.iter().map(|port| port.value.clone()).collect::<Option<Vec<_>>>() {
                None => outputs.iter_mut().for_each(|port| port.value = None),
                Some(inputs) => outputs.iter_mut()
                                    .zip((node.behavior)(&inputs)?.into_iter())
                                    .for_each(|(old, new)| old.value = Some(new))
            }


            outputs.iter().for_each(|oport| {
                oport.endpoint.iter().for_each(|&(out_id, out_port)| {
                    if !visited[out_id] {
                        q.push_back(out_id);
                    }
                    self.nodes[out_id]
                        .as_mut()
                        .unwrap()
                        .inputs[out_port]
                        .value = oport.value.clone();
                });
            });

            std::mem::swap(&mut outputs, &mut self.nodes[front].as_mut().unwrap().outputs);
        }

        Ok(
            visited.iter()
                .zip((0..visited.len())
                .into_iter())
                .filter_map(|(visited, id)| if *visited {Some(id)} else {None})
                .collect()
        )
    }
}
