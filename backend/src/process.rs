use crate::{Behavior, DataType};
use serde_json::{Value, json};
use std::process::Command;
use std::error::Error;

use std::fs::File;
use std::io::BufReader;
use std::path::Path;

static META_NAME: &str = "meta.json";

/*** 
* METADATA STRUCTURE:
* {
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


    let input_types = meta["inputs"]
                        .as_array()
                        .ok_or_else(|| "inputs is not a list".to_string())?
                        .iter()
                        .map(parse_type)
                        .collect::<Result<Vec<_>, _>>()?;

    let output_types = meta["inputs"]
                        .as_array()
                        .ok_or_else(|| "inputs is not a list".to_string())?
                        .iter()
                        .map(parse_type)
                        .collect::<Result<Vec<_>, _>>()?;
    
    Ok(Process {
        run: Box::new(run),
        input_types,
        output_types,
    })
}

pub fn parse_type(v: &Value) -> Result<DataType, Box<dyn Error>> {

    let literal = |str| -> Result<DataType, Box<dyn Error>> {
        match str {
            "string" => Ok(DataType::String),
            "int" => Ok(DataType::Int),
            "float" => Ok(DataType::Float),
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


struct Process {
    run: Behavior,
    input_types: Vec<DataType>,
    output_types: Vec<DataType>,
}
