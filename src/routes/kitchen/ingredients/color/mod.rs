#[derive(Debug, Clone, Copy)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl Color {
    pub fn set_r(&mut self, red: u8) {
        self.r = red;
    }
    pub fn set_g(&mut self, green: u8) {
        self.g = green;
    }
    pub fn set_b(&mut self, blue: u8) {
        self.b = blue;
    }
}

impl Default for Color {
    fn default() -> Self {
        Self { r: 0, g: 0, b: 0 }
    }
}

impl PartialEq for Color {
    fn eq(&self, other: &Self) -> bool {
        self.r == other.r && self.g == other.g && self.b == other.b
    }
}


// impl Clone for Color {
//     fn clone(&self) -> Self {
//         Self {
//             r: self.r,
//             g: self.g,
//             b: self.b,
//         }
//     }
// }