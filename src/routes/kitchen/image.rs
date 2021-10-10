#[wasm_bindgen]
pub struct Image {
    width: usize,
    height: usize,
}

#[wasm_bindgen]
impl Image {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> Self {
        Self {
            width,
            height,
        }
    }

    pub fn width(&self) -> usize {
        self.width
    }

    pub fn height(&self) -> usize {
        self.height
    }

    // pub fn update() {
    //
    // }
    //
    // pub fn render() {
    //
    //     canvas.getContext();
    // }
}