import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as LittersState from '../store/Litters';

// At runtime, Redux will merge together...
type LittersProps =
    LittersState.LittersState        // ... state we've requested from the Redux store
    & typeof LittersState.actionCreators      // ... plus action creators we've requested
    & RouteComponentProps<{ startDateIndex: string }>; // ... plus incoming routing parameters

class FetchData extends React.Component<LittersProps, {}> {
    componentWillMount() {
        // This method runs when the component is first added to the page
        let startDateIndex = parseInt(this.props.match.params.startDateIndex) || 0;
        this.props.requestLitters(startDateIndex);
    }

    componentWillReceiveProps(nextProps: LittersProps) {
        // This method runs when incoming props (e.g., route params) change
        let startDateIndex = parseInt(nextProps.match.params.startDateIndex) || 0;
        this.props.requestLitters(startDateIndex);
    }

    public render() {
        return <div>
            <h1>Weather forecast</h1>
            <p>This component demonstrates fetching data from the server and working with URL parameters.</p>
            { this.renderForecastsTable() }
            { this.renderPagination() }
        </div>;
    }

    private renderForecastsTable() {
        return <table className='table'>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Born</th>
                    <th>Price</th>
                    <th>Deposit</th>
                    <th>Breed</th>
                </tr>
            </thead>
            <tbody>
            {this.props.litters.map(litter =>
                <tr key={litter.id }>
                    <td>{litter.id }</td>
                    <td>{new Date(litter.bornOn).toLocaleDateString("en-NZ") }</td>
                    <td>{litter.price.toLocaleString(  'en-NZ', { style: 'currency', currency: 'NZD' }) }</td>
                    <td>{litter.deposit.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD' }) }</td>
                    <td>{litter.breed }</td>
                </tr>
            )}
            </tbody>
        </table>;
    }

    private renderPagination() {
        let prevStartDateIndex = (this.props.startDateIndex || 0) - 5;
        let nextStartDateIndex = (this.props.startDateIndex || 0) + 5;

        return <p className='clearfix text-center'>
            <Link className='btn btn-default pull-left' to={ `/fetchdata/${ prevStartDateIndex }` }>Previous</Link>
            <Link className='btn btn-default pull-right' to={ `/fetchdata/${ nextStartDateIndex }` }>Next</Link>
            { this.props.isLoading ? <span>Loading...</span> : [] }
        </p>;
    }
}

export default connect(
    (state: ApplicationState) => state.litters, // Selects which state properties are merged into the component's props
    LittersState.actionCreators                 // Selects which action creators are merged into the component's props
)(FetchData) as typeof FetchData;
