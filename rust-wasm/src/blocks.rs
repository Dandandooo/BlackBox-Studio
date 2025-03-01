#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
enum Language {
    Rust,
    Python,
    C,
    Cpp,
    JavaScript
}

struct Argument {
}

struct Data<T> {
    dtype: String,
    value: T
}

struct Block {
    lang: Language,
    input: Vec<Argument>,
    code: String,
}

impl Clone for Block {
    fn clone(&self) -> Block {
        Block {
            lang: self.lang.clone(),
            input: self.input.clone(),
            code: self.code.clone(),
        }
    }
}