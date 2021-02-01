import React, { Component } from "react";
import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";

import "./PathfindingVisualizer.css";

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [],
      mouseIsPressed: false
    };
  }

  // Initialization
  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
  }

  // These next 3 handleMouse functions take care of creating the walls in the grid.
  handleMouseDown(row, col) {
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid, mouseIsPressed: true });
  }

  // Only generate walls if we press on the mouse. (not hover)
  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }

  // Once we let go of mouse button, stop generating walls.
  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  // Grab the return value of visitedNodesInOrder = Dijkstra(grid, startNode, finishNode)
  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      // If we are done with setTimeout.
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          // Then animateShortestPath
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      // Update the class to node-visited.
      // This is only a hack solution to help with animation speed. (not the best practice)
      // Since re-rendering the entire component every 10ms was too slow.
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      // Same concept as above, but for shortest path.
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    // First, call dijkstra() to return the array of visited nodes in order.
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    // Then, get the shortest path by starting at the finishNode and making your way back.
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    // Then, call animateDijkstra() to return for every node, create a new node off that same node, and mark it as isVisited.
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  render() {
    const { grid, mouseIsPressed } = this.state;

    return (
      <>
        <button className="ready" onClick={() => this.visualizeDijkstra()}>
          Visualize Dijkstra's Algorithm!
        </button>
        <p>Click on the grid to generate walls!</p>
        <p>* This project is still in BETA and I am working on creating more algorithms. Currently, this will look better on Desktop only. <br>
          But you should still be able to visualize Dijkstra's Algorithm and find the shortest path between two nodes.</p>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            // Iterate through every row and col, then create a node.
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isStart, isFinish, isWall } = node;
                  return (
                    // When you render the nodes, pass isStart, isFinish as properties.
                    <Node
                      key={nodeIdx}
                      col={col}
                      isStart={isStart}
                      isFinish={isFinish}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}
// Create initial grid.
const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};
// Create node with its properties.
const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null
  };
};
// For the handleMouse functions. Toggle between wall or not a wall.
const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
