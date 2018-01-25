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
        this.props.requestLitter(id);
    }

    public render() {
        if (this.props.litter) {
            this.props.litter.available = new Date();
            this.props.litter.available.setTime(new Date(this.props.litter.bornOn).getTime() + this.props.litter.weeksToWean * 7 * 24 * 60 * 60 * 1000);
            return <div className="litter-grid row">
                <div className="litter-pic col-sm-4"><img src={this.props.litter.pictureUrl} /></div>
                <div className="litter-details col-sm-4">
                    <p>
                        <b>Breed:</b> {this.props.litter.breed}
                        <br />
                        <b>Location:</b> {this.props.litter.user.location}
                        <br />
                        <b>Contact:</b> {this.props.litter.user.name}
                        <br />
                        <b>Phone:</b> {this.props.litter.user.phone}
                        <br />
                        <b>Born:</b> {new Date(this.props.litter.bornOn).getDate() + "/" + (new Date(this.props.litter.bornOn).getMonth() + 1) + "/" + new Date(this.props.litter.bornOn).getFullYear()}
                        <br />
                        <b>Available:</b> {this.props.litter.available.getDate() + "/" + (this.props.litter.available.getMonth() + 1) + "/" + this.props.litter.available.getFullYear()}
                        <br />
                        <b>Price:</b> {"$" + this.props.litter.price.toFixed(2)}
                        <br />
                        <b>Deposit:</b> {"$" + this.props.litter.deposit.toFixed(2)}
                    </p>
                    <p>
                        {this.props.litter.description}
                    </p>
                </div>
                <div className="animals-grid col-sm-4">{this.renderGrid()}</div>
            </div>;
        }
        else
            return <div></div>;
    }

    private renderGrid() {
        if (this.props.litter)
            return <div>
                {this.props.litter.animals.map(animal =>
                    <div className="grid-item" key={animal.id}>
                        <Link to={'/animal/' + animal.id}>
                            <div><img src={animal.pictureUrl} /></div>
                            <b>{animal.isFemale ? "Female" : "Male"}</b>
                            <br />
                            <i>{animal.sold ? "Sold" : (animal.hold ? "On Hold" : "For Sale")}</i>
                            <br />
                            {animal.description}
                        </Link>
                    </div>
                )}
            </div>;
        else
            return <div></div>;
   }
}

export default connect(
    (state: ApplicationState) => state.litter, // Selects which state properties are merged into the component's props
    LitterState.actionCreators                 // Selects which action creators are merged into the component's props
)(Litter) as typeof Litter;
