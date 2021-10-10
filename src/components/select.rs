// use std::cell::Cell;
// use std::collections::HashMap;
// use yew::{html, Callback, Component, ComponentLink, Html, ChangeData, Properties, ShouldRender, html::IntoPropValue};

// thread_local! {
//     static SELECT_ID: Cell<usize> = Cell::default();
// }
// fn next_select_id() -> usize {
//     SELECT_ID.with(|cell| cell.replace(cell.get() + 1))
// }

// // trait OptionValue: 'static + Clone + PartialEq + IntoPropValue<std::option::Option<std::borrow::Cow<'static, str>>> {}

// #[derive(Clone, Debug, PartialEq, Properties)]
// pub struct Props<T: 'static + Clone + PartialEq + IntoPropValue<Option<std::borrow::Cow<'static, str>>>> {
//     pub label: &'static str,
//     pub options: HashMap<String, T>,
//     pub selected: String,
//     pub onchange: Callback<T>,
// }

// pub struct Select<T: 'static + Clone + PartialEq + IntoPropValue<Option<std::borrow::Cow<'static, str>>>> {
//     props: Props<T>,
//     id: usize,
// }

// impl<T: 'static + Clone + PartialEq + IntoPropValue<Option<std::borrow::Cow<'static, str>>>> Component for Select<T> {
//     type Message = ();
//     type Properties = Props<T>;

//     fn create(props: Self::Properties, _link: ComponentLink<Self>) -> Self {
//         Self {
//             props,
//             id: next_select_id(),
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
//             options,
//             selected,
//             ref onchange,
//         } = self.props;

//         let id = format!("select-{}", self.id);

//         html! {
//             <select id=id class="select" onchange=onchange.reform(|data: ChangeData| if let ChangeData::Select(change) = data {
//                 *options.get(&change.value()).unwrap()
//             } else {
//                 panic!()
//             })>
//                 { for options.iter().map(|(&name, &value)| html! {<option value=name>{name}</option>}) }
//             </select>
//         }
//     }
// }