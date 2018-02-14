import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as LittersState from '../store/Litters';
import * as $ from "jquery";

type LittersProps = LittersState.LittersState & typeof LittersState.actionCreators & RouteComponentProps<{ id: string }>;
class Litters extends React.Component<LittersProps, {}> {
    private placeholder_image = "./img/placeholder-500.png";

    componentWillMount() {
        // This method runs when the component is first added to the page
        this.props.requestLitters(this.props.match.params.id);
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
        this.props.litters.forEach(litter => {
            var available = new Date(litter.bornOn);
            available.setTime(available.getTime() + litter.weeksToWean * 7 * 24 * 60 * 60 * 1000);
            litter.available = ('0' + available.getDate()).slice(-2) +
                "/" + ('0' + (available.getMonth() + 1)).slice(-2) +
                "/" + available.getFullYear().toString().substring(2);
        });
        return <div className="litters-grid">
            {/*<h4>Showing <u>cats</u>▼ in <u>Auckland</u>▼ sorted by <u>Date</u>▼</h4>*/}
            { this.renderGrid() }
            { this.renderPagination() }
        </div>;
    }

    private renderGrid() {
        return <div key={this.props.userid}>
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
                        Available {litter.available}
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
