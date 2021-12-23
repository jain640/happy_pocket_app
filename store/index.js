import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from '../reducers';
import loggerMiddleware from 'redux-logger'

export default store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
