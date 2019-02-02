import React from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import {connect} from 'react-redux'

import {cellNumberInClue, getAnyRelated} from 'utils/puzzle'
import {cellClick} from 'reducers/puzzle'

import css from './Cell.scss'


class Cell extends React.Component {
  constructor(props) {
    super(props)

    this.throttledHandleScroll = _.debounce(this.updateCellFonts, 50)
  }

  componentDidMount() {
    this.updateCellFonts()
    window.addEventListener('resize', this.throttledHandleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledHandleScroll)
  }

  updateCellFonts = () => {
    console.log('update cell fonts')
    const cellGuess = this.cellGuess
    const cellNumber = this.cellNumber
    const cellContainer = this.cellContainer

    if (!cellContainer) {
      return
    }

    const cellWidth = cellContainer.getBoundingClientRect().width

    const guessWidth = cellWidth * .7
    cellGuess.style.fontSize = `${guessWidth}px`
    cellGuess.style.lineHeight = `${guessWidth}px`

    const numberWidth = cellWidth * .2
    cellNumber.style.fontSize = `${numberWidth}px`
    cellNumber.style.lineHeight = `${numberWidth}px`
  }

  render() {
    const {open, cheated, solved, revealed, active, selected, related} = this.props
    const closed = !open

    const squareClasses = classNames(css.cell, {
      [css.cell_selected]: selected,
      [css.cell_active]: active,
      [css.cell_closed]: closed,
      [css.cell_related]: related,
    })

    if (closed) {
      return <div className={squareClasses}/>
    }

    const cheatClasses = classNames({
      [css.cheat]: cheated,
      [css.revealed]: revealed,
    })

    const tatterClasses = classNames({
      [css.tatter]: revealed
    })

    const guessClasses = classNames(css.guess, {
      [css.solved]: solved,
    })

    return (
      <div
        className={squareClasses}
        onClick={this.props.cellClick}
        ref={cellContainer => {this.cellContainer = cellContainer}}
      >
        <div className={cheatClasses}>
          <div className={tatterClasses}/>
        </div>
        <div className={css.number} ref={cellNumber => {
          this.cellNumber = cellNumber
        }}>
          {this.props.clueStart}
        </div>
        <div className={guessClasses} ref={cellGuess => {
          this.cellGuess = cellGuess
        }}>
          {this.props.guess}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const {cells, activeDirection, clues, activeCellNumber, width} = state.puzzle[ownProps.puzzleName] || {}
  if (state.modal.activeModal === 'start') {
    return {
      ...cells[ownProps.cellNumber],
    }
  }

  const activeCell = cells[activeCellNumber]
  const activeClue = clues[activeDirection][activeCell.cellClues[activeDirection]]

  return {
    active: activeCellNumber === ownProps.cellNumber,
    selected: cellNumberInClue(ownProps.cellNumber, activeClue, activeDirection, width),
    related: getAnyRelated(ownProps.cellNumber, activeClue, clues, width),
    ...cells[ownProps.cellNumber],
  }
}

const mapDispatchToProps = dispatch => {
  return {
    cellClick: (puzzleName, cellNumber) => () => dispatch(cellClick(puzzleName, cellNumber)),
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    cellClick: dispatchProps.cellClick(ownProps.puzzleName, ownProps.cellNumber),
  }
}

const connectedCell = connect(mapStateToProps, mapDispatchToProps, mergeProps)(Cell)

export {
  connectedCell as Cell,
}
