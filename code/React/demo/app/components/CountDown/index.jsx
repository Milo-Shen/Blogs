import React from "react";

class CountDown extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {time} = this.props;
        return (
            <h3>{`当前时间:${new Date(time).toLocaleString()}`}</h3>
        )
    }
}

export default CountDown;