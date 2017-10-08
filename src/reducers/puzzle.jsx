import { call, put, takeLatest, all } from 'redux-saga/effects';

import { puzzleFetcher } from 'utils/fetcher';
import { generateGrid } from 'utils/puzzle';

const FETCH_PUZZLE = 'puzzle/FETCH_PUZZLE';
const FETCH_PUZZLE_RECEIVE = 'puzzle/FETCH_PUZZLE_RECEIVE';

export function fetchPuzzle(name) {
  return {
    type: FETCH_PUZZLE,
    name,
  };
}

function fetchPuzzleReceive(name, response) {
  return {
    type: FETCH_PUZZLE_RECEIVE,
    name,
    response,
  };
}

function* fetchPuzzleRequest(action) {
  const response = yield call(puzzleFetcher, `/puzzles/${action.name}.json`);
  yield put(fetchPuzzleReceive(action.name, response));
}

function* watchPuzzle() {
  yield takeLatest(FETCH_PUZZLE, fetchPuzzleRequest);
}

export function* rootSaga() {
  yield all([
    watchPuzzle(),
  ]);
}

export function reducer(state = {}, action) {
  switch (action.type) {
    case FETCH_PUZZLE_RECEIVE: {
      const puzzleObject = action.response[0];
      return {
        ...state,
        [action.name]: {
          data: puzzleObject,
          grid: generateGrid(puzzleObject),
        },
      };
    }

    default: {
      return state;
    }
  }
}