pub use color::Color;
pub use pierogi::Pierogi;

mod color;
mod pierogi;

#[derive(Debug, PartialEq, Clone)]
pub enum Ingredients {
    Color(Color),
    Pierogi(Pierogi),
}
