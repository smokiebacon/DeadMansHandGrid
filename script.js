document.addEventListener("DOMContentLoaded", function () {
  // Define cell states
  const STATES = {
    EMPTY: "empty",
    CHECKMARK: "checkmark",
    QUESTION: "question",
    NOT: "not",
    X: "x",
  }

  // Define symbols for each state
  const SYMBOLS = {
    [STATES.EMPTY]: "",
    [STATES.CHECKMARK]: "✓",
    [STATES.QUESTION]: "?",
    [STATES.NOT]: "no",
    [STATES.X]: "×",
  }

  // Define colors for each state
  const COLORS = {
    [STATES.CHECKMARK]: "green",
    [STATES.QUESTION]: "blue",
    [STATES.NOT]: "red",
    [STATES.X]: "red",
    [STATES.EMPTY]: "black",
  }

  const grids = document.querySelectorAll(".grid-container")

  function hasCheckmarkInRowOrColumn(cell, grid) {
    const rowIndex = Math.floor(Array.from(grid.children).indexOf(cell) / 6)
    const columnIndex = Array.from(grid.children).indexOf(cell) % 6

    const rowCells = Array.from(grid.children).slice(
      rowIndex * 6,
      (rowIndex + 1) * 6
    )
    const columnCells = Array.from(grid.children).filter(
      (_, index) => index % 6 === columnIndex
    )

    return [...rowCells, ...columnCells].some(
      (otherCell) => otherCell !== cell && otherCell.state === STATES.CHECKMARK
    )
  }

  function markRowAndColumn(cell, grid) {
    const rowIndex = Math.floor(Array.from(grid.children).indexOf(cell) / 6)
    const columnIndex = Array.from(grid.children).indexOf(cell) % 6

    const rowCells = Array.from(grid.children).slice(
      rowIndex * 6,
      (rowIndex + 1) * 6
    )
    const columnCells = Array.from(grid.children).filter(
      (_, index) => index % 6 === columnIndex
    )

    // X out row and column
    ;[...rowCells, ...columnCells].forEach((otherCell) => {
      if (
        otherCell !== cell &&
        (!otherCell.state || otherCell.state === STATES.EMPTY)
      ) {
        updateCell(otherCell, STATES.X)
      }
    })
  }

  function clearRowAndColumn(cell, grid) {
    const rowIndex = Math.floor(Array.from(grid.children).indexOf(cell) / 6)
    const columnIndex = Array.from(grid.children).indexOf(cell) % 6

    const rowCells = Array.from(grid.children).slice(
      rowIndex * 6,
      (rowIndex + 1) * 6
    )
    const columnCells = Array.from(grid.children).filter(
      (_, index) => index % 6 === columnIndex
    )

    // Get all checkmark cells
    const checkmarkCells = Array.from(grid.children).filter(
      (cell) => cell.state === STATES.CHECKMARK
    )

    // Clear X's only if they're not part of any checkmark's row or column
    ;[...rowCells, ...columnCells].forEach((otherCell) => {
      if (otherCell.state === STATES.X) {
        // Check if this X is part of any checkmark's row or column
        const shouldKeepX = checkmarkCells.some((checkmark) => {
          const checkRowIndex = Math.floor(
            Array.from(grid.children).indexOf(checkmark) / 6
          )
          const checkColumnIndex =
            Array.from(grid.children).indexOf(checkmark) % 6
          const otherCellIndex = Array.from(grid.children).indexOf(otherCell)
          const otherCellRow = Math.floor(otherCellIndex / 6)
          const otherCellColumn = otherCellIndex % 6

          return (
            checkRowIndex === otherCellRow ||
            checkColumnIndex === otherCellColumn
          )
        })

        if (!shouldKeepX) {
          updateCell(otherCell, STATES.EMPTY)
        }
      }
    })
  }

  function isInCheckmarkPath(cell, grid) {
    const cellIndex = Array.from(grid.children).indexOf(cell)
    const cellRow = Math.floor(cellIndex / 6)
    const cellColumn = cellIndex % 6

    // Check if cell is in any checkmark's row or column
    return Array.from(grid.children).some((otherCell, index) => {
      if (otherCell.state === STATES.CHECKMARK) {
        const checkRow = Math.floor(index / 6)
        const checkColumn = index % 6
        return cellRow === checkRow || cellColumn === checkColumn
      }
      return false
    })
  }

  function updateCell(cell, newState) {
    cell.state = newState
    cell.innerHTML = SYMBOLS[newState]
    cell.style.color = COLORS[newState]
  }

  grids.forEach((grid) => {
    grid.addEventListener("click", function (e) {
      const cell = e.target
      if (!cell.classList.contains("grid-item")) return

      const currentState = cell.state || STATES.EMPTY

      switch (currentState) {
        case STATES.EMPTY:
          updateCell(cell, STATES.NOT)
          break

        case STATES.NOT:
          if (isInCheckmarkPath(cell, grid)) {
            return
          }
          // Check if there's already a checkmark in the row or column
          if (hasCheckmarkInRowOrColumn(cell, grid)) {
            // Skip to question mark if there's already a checkmark
            updateCell(cell, STATES.QUESTION)
          } else {
            updateCell(cell, STATES.CHECKMARK)
            markRowAndColumn(cell, grid)
          }
          break

        case STATES.CHECKMARK:
          updateCell(cell, STATES.QUESTION)
          clearRowAndColumn(cell, grid)
          break

        case STATES.QUESTION:
          // Check if the cell is in a checkmark's path
          if (isInCheckmarkPath(cell, grid)) {
            updateCell(cell, STATES.X)
          } else {
            updateCell(cell, STATES.EMPTY)
          }
          break
      }
    })
  })
  document.getElementById("clearButton").addEventListener("click", function () {
    const gridItems = document.querySelectorAll(".grid-item")
    gridItems.forEach((item) => {
      updateCell(item, STATES.EMPTY)
    })
  })
})
