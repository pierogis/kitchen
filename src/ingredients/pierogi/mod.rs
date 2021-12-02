#[derive(Debug, Clone)]
pub struct Pierogi {
    pub src: Option<String>,
}

// impl Default for Pierogi {
//     fn default() -> Self {
//         Self { r: 0, g: 0, b: 0 }
//     }
// }

impl PartialEq for Pierogi {
    fn eq(&self, other: &Self) -> bool {
        self.src == other.src
    }
}
