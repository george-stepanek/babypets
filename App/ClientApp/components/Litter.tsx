import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LitterState from '../store/Litter';

// At runtime, Redux will merge together...
type LitterProps =
    LitterState.LitterState        // ... state we've requested from the Redux store
    & typeof LitterState.actionCreators      // ... plus action creators we've requested
    & RouteComponentProps<{ id: string }>; // ... plus incoming routing parameters

class Litter extends React.Component<LitterProps, {}> {
    componentWillMount() {
        // This method runs when the component is first added to the page
        let id = parseInt(this.props.match.params.id) || 0;
    }

    componentWillReceiveProps(nextProps: LitterProps) {
        // This method runs when incoming props (e.g., route params) change
        let id = parseInt(nextProps.match.params.id) || 0;
    }

    public render() {
        return <div>Litter id = {this.props.match.params.id}</div>;
    }
}

export default connect(
    (state: ApplicationState) => state.litter, // Selects which state properties are merged into the component's props
    LitterState.actionCreators                 // Selects which action creators are merged into the component's props
)(Litter) as typeof Litter;
