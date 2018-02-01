import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as LittersState from '../store/Litters';
import * as $ from "jquery";

// At runtime, Redux will merge together...
type LittersProps =
    LittersState.LittersState        // ... state we've requested from the Redux store
    & typeof LittersState.actionCreators      // ... plus action creators we've requested
    & RouteComponentProps<{ startDateIndex: string }>; // ... plus incoming routing parameters

class Litters extends React.Component<LittersProps, {}> {
    private placeholder_image = "https://www.mikkis.co.uk/themes/responsive/images/placeholder-500.png";

    componentWillMount() {
        // This method runs when the component is first added to the page
        let startDateIndex = parseInt(this.props.match.params.startDateIndex) || 0;
        this.props.requestLitters(startDateIndex);
    }

    componentWillReceiveProps(nextProps: LittersProps) {
        // This method runs when incoming props (e.g., route params) change
        //let startDateIndex = parseInt(nextProps.match.params.startDateIndex) || 0;
        //this.props.requestLitters(startDateIndex);
    }

    componentDidMount() {
        var self = this;
        $('.grid-item img').on('error', function () {
            $(this).attr("src", self.placeholder_image);
        });
    }

    public render() {
        return <div>
            <h4>Showing <u>cats</u>▼ in <u>Auckland</u>▼ sorted by <u>Date</u>▼</h4>
            { this.renderGrid() }
            { this.renderPagination() }
        </div>;
    }

    private renderGrid() {
        return <div>
            {this.props.litters.map(litter =>
                <div className="grid-item" key={litter.id}>
                    <Link to={'/litter/' + litter.id}>
                        <div>
                            <img src={litter.pictureUrl ? litter.pictureUrl : this.placeholder_image } />
                        </div>
                        {litter.breed}
                        <br />
                        {litter.user.location}
                        <br />
                        {"$" + litter.price.toFixed(2)}
                    </Link>
                </div>
            )}
        </div>;
    }

    private renderPagination() {
     /* let prevStartDateIndex = (this.props.startDateIndex || 0) - 5;
        let nextStartDateIndex = (this.props.startDateIndex || 0) + 5;

        return <p className='clearfix text-center'>
            <Link className='btn btn-default pull-left' to={ `/fetchdata/${ prevStartDateIndex }` }>Previous</Link>
            <Link className='btn btn-default pull-right' to={ `/fetchdata/${ nextStartDateIndex }` }>Next</Link>
            { this.props.isLoading ? <span>Loading...</span> : [] }
        </p>; */
    }
}

export default connect(
    (state: ApplicationState) => state.litters, // Selects which state properties are merged into the component's props
    LittersState.actionCreators                 // Selects which action creators are merged into the component's props
)(Litters) as typeof Litters;
