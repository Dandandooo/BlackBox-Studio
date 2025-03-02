use crate::{Behavior, DataType};
use serde_json::{Value, json};
use std::process::Command;
use std::error::Error;

use std::fs::File;
use std::io::BufReader;
use std::path::{Path, PathBuf};

/*** 
* METADATA STRUCTURE:
* {
*   "name" : "fart",
*   "language": "python",
*   "run": "./foo",
*   "inputs": [
*       {"x": "float"},
*       {"y": "float"},
*       {"positions": [
*           {"x": "float", "y": "float"}
*       ]}
*   ]
*   "outputs": [
*       {"iterations": "int"},
*       {"dave": {
*           "age": "int",
*           "size": "float",
*           "hearing_range": "float",
*           "rapper_name": "string",
*           "extra_info": {{}}
*       }}
*   ]
* }
***/

pub fn load_process(path: &Path) -> Result<Process, Box<dyn Error>>{
    let file = File::open(path)?;
    let reader = BufReader::new(file);
    let meta: Value = serde_json::from_reader(reader)?;

    let name = meta["name"].as_str().ok_or_else(|| -> Box<dyn Error> {
        "name was not a string".to_string().into()
    })?.to_string();

    let language = meta["name"].as_str().map(|str| str.to_string());

    let run_command = meta["run"].as_str().ok_or_else(|| -> Box<dyn Error> {
        "run was not a string".to_string().into()
    })?.to_string();


    let run = move |inputs: &Vec<String>| -> Result<Vec<String>, String> {
        let jsn = json!(inputs);

        let binding = Command::new(run_command.clone())
            .arg(jsn.to_string())
            .output().map_err(|err| err.to_string())?;

        let process_output = binding
            .stdout
            .as_slice();

        Ok(json!(process_output)
            .as_array()
            .ok_or_else(|| "output not valid json array".to_string())?
            .iter()
            .map(|val| val.to_string())
            .collect())
    };

    let (input_names, input_types) = meta["inputs"]
                        .as_array()
                        .ok_or_else(|| "inputs is not a list".to_string())?
                        .iter()
                        .map(|input| 
                            (input.as_object()
                                .ok_or_else(|| "argument must be named".to_string())?
                                .iter()
                                .next()
                                .map(|(k, v)| Ok::<(String, DataType), Box<dyn Error>>((k.clone(), parse_type(v)?)))
                                .ok_or_else(|| "argument must have".to_string())?)
                        )
                        .collect::<Result<(Vec<_>, Vec<_>), _>>()?;

    let (output_names, output_types) = meta["outputs"]
                        .as_array()
                        .ok_or_else(|| "outputs is not a list".to_string())?
                        .iter()
                        .map(|output| 
                            (output.as_object()
                                .ok_or_else(|| "output must be named".to_string())?
                                .iter()
                                .next()
                                .map(|(k, v)| Ok::<(String, DataType), Box<dyn Error>>((k.clone(), parse_type(v)?)))
                                .ok_or_else(|| "output must have".to_string())?)
                        )
                        .collect::<Result<(Vec<_>, Vec<_>), _>>()?;
    
    Ok(Process {
        name,
        language,
        path: path.to_path_buf(),
        run: Box::new(run),
        input_names,
        input_types,
        output_names,
        output_types,
    })
}

pub fn parse_type(v: &Value) -> Result<DataType, Box<dyn Error>> {

    let literal = |str| -> Result<DataType, Box<dyn Error>> {
        match str {
            "string" => Ok(DataType::String),
            "number" => Ok(DataType::Number),
            "bool" => Ok(DataType::Bool),
            _ => Err(format!("invalid type: {str}").into())
        }
    };

    match v {
        Value::String(str) => literal(str),
        Value::Array(vec) => Ok(DataType::Array(Box::new(
            parse_type(vec.first().ok_or_else(|| "array must specify inner type".to_string())?)?
        ))),
        Value::Object(map) => 
            if map.is_empty() {
                Ok(DataType::FreeJson)
            } else {
                Ok(DataType::Json(
                    map.iter()
                       .map(|(key, val)| parse_type(val).map(|val| (key.clone(), val)))
                       .collect::<Result<Vec<_>, _>>()?
                ))
            },
        _ => Err("json type must be denoted as string, array, or object".to_string().into())

    }
}

pub struct Process {
    pub name: String,
    pub language: Option<String>,
    pub path: PathBuf,
    pub run: Behavior,
    pub input_names: Vec<String>,
    pub input_types: Vec<DataType>,
    pub output_names: Vec<String>,
    pub output_types: Vec<DataType>,
}
