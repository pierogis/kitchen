# todo

- [ ] recipe

  - [x] terminals
  - [x] connections
  - [x] update "master" state
    - [ ] ex: cables store broadcasts changes to its payloads
    - [x] createIngredient needs to addIngredient, addCallFor, etc. at the same time
      - [x] update large state object or create uuids and add to location first
      - [x] event dispatch situation
  - [x] fix ingredient delete
  - [x] split `createIngredient` into multiple actions (for each added thing)
  - [x] add liveConnection to terminals derived
  - [x] detect near terminals and take the closest non live
  - [x] fix live cable undefined initial coordinates
  - [x] flavors should not reorder when one becomes a monitor
  - [ ] image input
    - [ ] canvas when monitor
    - [ ] file input when input
  - [ ] docked flavors
    - [ ] display
    - [ ] editing
  - [ ] change focused flavor
  - [ ] edit ingredient name
  - [ ] propagate parameter/cable payloads
  - [ ] update location state
  - [ ] shader editor tab (if focused ingredient has shader)
  - [ ] undo and redo interaction
    - [ ] test action redo and undo in state
    - [ ] ui for redo and undo (keyboard shortcuts)
  - [ ] sync state with local storage
  - [ ] save to backend (on push)
    - [ ] branching versions (cool to have)
  - [ ] duplicate/reuse ingredient

- [ ] pan

  - [ ] cooking images in progress

- [ ] backend
  - [ ] retrieve full recipe from db on request
  - [ ] accept new recipe state
