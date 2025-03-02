# BlackBox Studio
<p>
    <img src="https://img.shields.io/badge/Contributors-4-purple?logo=github" alt="Four Contributors" >
    <img src="https://img.shields.io/badge/Minecraft References-∞-green?logo=mojang studios" alt="Infinite Minecraft References">
    <img src="https://img.shields.io/badge/Frontend-React-blue?logo=react" alt="React Frontend">
    <img src="https://img.shields.io/badge/Backend-Actix-orange?logo=rust" alt="Actix Backend">
</p>
## How to Run for yourself

1. `cd backup`
2. `npm i`
3. `npm run dev`

## Inspiration
Graphs are cool. They let us represent ideas as webs of complex relationships and intricate behavior. Sometimes, we wish we could develop our code in this kind of idea web, linking functions to each other in a graphical way.

To address this issue, we came up with Blackbox Studio, a tool that helps you form this complex web of functionality.

## What it does
BlackBox Studio has three main goals:
1. Isolate functions into black boxes, with input and output interfaces.
2. Communicate between functions.
3. Build a graph view of information flow between functions.

## How we built it
We built our service in two separate servers:
1. Front-end graph interface (built in ReactJS & react-flow)
    1. Custom nodes, connections, and actions on each interaction between nodes.
    2. Lots of manual styling
    3. Special themes
2. Back-end functionality and function interfaces (built in Rust Actix)
    1. Custom serialization protocols
    2. Internal data type management
    3. Value propagation through stored DAG
    4. Process spawning


## Challenges we ran into
1. Interprocess Communication
2. Learning to fight with default styling
3. JSON parsing errors during backend graph crawling
4. Interlanguage communication

## Accomplishments that we're proud of
1. Gorgeous graph interface
2. Snappy function I/O
4. _Super Secret Settings_

## What we learned
We learned that interacting between servers is never easy. From problems in running both, to running them at the same time, to finally having them talk to each other, we encountered countless difficulties.

## What's next for BlackBox Studio
Apart from minor visual touch ups, some useful features for the future include:
1. Code editing inside. This is not an intended main goal, since everyone has a favorite editor.
2. D3-Force implementation: adding physics simulation to make the graph interface feel more intuitive.
3. Packaging into electron. Currently, it is a web-based studio.
4. Minimizing the menus
5. Finalizing inter-language communication
