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
        this.props.requestLitters(this.props.match.params.id, "", "");
    }

    componentWillReceiveProps(nextProps: LittersProps) {
        // This method runs when incoming props (e.g., route params) change
    }

    filterLitters()
    {
        this.props.requestLitters(this.props.match.params.id, $("#animal").val() as string, $("#location").val() as string);
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
            {!this.props.match.params.id && (
                <p>
                    <select id="animal" name="animal" onChange={() => { this.filterLitters() }}>
                        <option value="">All Animals</option>
                        <option value="Cat">Cats</option>
                        <option value="Dog">Dogs</option>
                        <option value="Rodent">Rodents</option>
                    </select>&nbsp;in&nbsp;
                    <select name="location" id="location" onChange={() => { this.filterLitters() }}>
                        <option value="">New Zealand</option>
                        <option value="Northland">Northland</option>
                        <option value="Auckland">Auckland</option>
                        <option value="Waikato">Waikato</option>
                        <option value="Bay of Plenty">Bay of Plenty</option>
                        <option value="Gisborne">Gisborne</option>
                        <option value="Hawke's Bay">Hawke's Bay</option>
                        <option value="Taranaki">Taranaki</option>
                        <option value="Manawatu-Wanganui">Manawatu-Wanganui</option>
                        <option value="Wellington">Wellington</option>
                        <option value="Tasman">Tasman</option>
                        <option value="Nelson">Nelson</option>
                        <option value="Marlborough">Marlborough</option>
                        <option value="West Coast">West Coast</option>
                        <option value="Canterbury">Canterbury</option>
                        <option value="Otago">Otago</option>
                        <option value="Southland">Southland</option>
                    </select>
                </p>
            )}
            { this.renderGrid() }
            { this.renderPagination() }
        </div>;
    }

    private renderGrid() {
        if (this.props.isLoading)
            return <div className="loading"><i className="fa fa-spinner fa-spin"></i></div>;
        else
            return <div key={this.props.userid}>
                {this.props.litters.map(litter =>
                    <div className="grid-item" key={litter.id}>
                        <Link to={'/litter/' + litter.id}>
                            <div>
                                <img src={litter.pictureUrl ? litter.pictureUrl.replace('/upload/', '/upload/c_fill,h_128,w_128/') : this.placeholder_image } />
                            </div>
                            {litter.breed}
                            <br />
                            {litter.user.location}
                            <br />
                            Available {litter.available}
                            <br />
                            {"$" + Math.floor(litter.price).toFixed(0)}
                        </Link>
                    </div>
                )}
            </div>;
    }

    private renderPagination() {
     /* let prevStartDateIndex = (this.props.startDateIndex || 0) - 5;
        let nextStartDateIndex = (this.props.startDateIndex || 0) + 5;

        return <p className='clearfix text-center'>
            <Link className='btn btn-primary pull-left' to={ `/fetchdata/${ prevStartDateIndex }` }>Previous</Link>
            <Link className='btn btn-primary pull-right' to={ `/fetchdata/${ nextStartDateIndex }` }>Next</Link>
            { this.props.isLoading ? <span>Loading...</span> : [] }
        </p>; */
    }
}

export default connect(
    (state: ApplicationState) => state.litters, // Selects which state properties are merged into the component's props
    LittersState.actionCreators                 // Selects which action creators are merged into the component's props
)(Litters) as typeof Litters;
