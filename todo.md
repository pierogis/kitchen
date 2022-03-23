# todo

- [ ] pass value through connection

  - [x] read from a store on the connection state

  - attach a tweakpane monitor instead of input
- [x] add node at mouse center

  - possibly includes adding top and left to store
- [ ] display

  - create some kind of docking system
    - nodes can drag into the docks on left and right side
    - eg
      - put pierogi node on the "in" side and it has a default file loaded and out terminals
      - put pierogi node on the "out" side with a no file picker? and in terminals?
      - important to minimize the change in function/ui when docked
    - in and out docks allow you to package the recipe into a node/ingredient itself
      - the fact that you can only use existing nodes for this means that their parameter sets are all supersets/composites
  - solve the image render graph
    - image slot store needs a reference to the file or something
    - could get messy
- [x] no novel terminal on live connection
- [ ] add optgroups to "type" select
  - each ingredient comes with a class bound enum like "shader", "meta"