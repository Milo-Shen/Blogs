import './index.css';

// 加载 React 框架
import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Perf from 'react-addons-perf'

// 加载自定义
import BaseComponent from '../../../components/BaseComponent';
import List from '../../../components/List';
import Count from '../../../components/Count';

// 加载 actions 事件
import * as actionCreators from '../../../actions';

class Home extends BaseComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let fetch = this.props.actions;
        fetch.fetch_list();
    }

    render() {
        const {state, actions} = this.props;
        return (
            <div className="homePage">
                <Count Count={state.MigrateData.get('Count')} actions={actions}/>
                <List list={state.async.get('list')}/>
            </div>
        )
    }
}

export default connect(
    state => ({state: state.toObject()}),
    dispatch => ({actions: bindActionCreators(actionCreators, dispatch)})
)(Home);