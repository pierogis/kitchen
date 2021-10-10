// use std::cell::Cell;

// use wasm_bindgen::closure::Closure;
// use web_sys::{FileReader, Event};
// use yew::{html, Callback, Component, ComponentLink, Html, Properties, ChangeData, ShouldRender};


// thread_local! {
//     static FILE_INPUT_ID: Cell<usize> = Cell::default();
// }
// fn next_file_input_id() -> usize {
//     FILE_INPUT_ID.with(|cell| cell.replace(cell.get() + 1))
// }

// #[derive(Clone, Debug, PartialEq, Properties)]
// struct Props {
//     pub label: &'static str,
//     pub onload: Callback<&'static str>,
// }

// pub struct FileInput {
//     props: Props,
//     id: usize,
// }

// impl Component for FileInput {
//     type Message = ();
//     type Properties = Props;

//     fn create(props: Self::Properties, _link: ComponentLink<Self>) -> Self {
//         Self {
//             props,
//             id: next_file_input_id(),
//         }
//     }

//     fn update(&mut self, _msg: Self::Message) -> ShouldRender {
//         unimplemented!()
//     }

//     fn change(&mut self, props: Self::Properties) -> ShouldRender {
//         if self.props != props {
//             self.props = props;
//             true
//         } else {
//             false
//         }
//     }

//     fn view(&self) -> Html {
//         let Props {
//             label,
//             ref onload,
//         } = self.props;

//         let id = format!("file-{}", self.id);

//         let onload_cb = Closure::wrap(Box::new(move |e: Event| {
//             let binary_str = e.target();
//             binary_str
//         }
            
//         ));

//         let onchange = onload.reform(|data: ChangeData| {
//             if let ChangeData::Files(files) = data {
//                 let reader = FileReader::new().unwrap();
//                 reader.set_onload(onload_cb);
//                 reader.read_as_binary_string(&files.get(0).unwrap());
//             } else {

//             }
//         });

//         html! {
//             <div class="file">
//                 <label for=id.clone() class="file-label">{ label }</label>
//                 <input type="file"
//                     id=id
//                     class="file-input"
//                     accept="image/*, video/*"
//                     onchange=onchange
//                 />
//             </div>
//         }
//     }
// }
