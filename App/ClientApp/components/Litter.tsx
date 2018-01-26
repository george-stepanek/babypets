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

export function formatDateString(date: Date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var day = ('0' + date.getDate()).slice(-2);
    var month = monthNames[date.getMonth()];
    return day + " " + month + " " + date.getFullYear();
}

class Litter extends React.Component<LitterProps, {}> {
    componentWillMount() {
        // This method runs when the component is first added to the page
        let id = parseInt(this.props.match.params.id) || 0;
        this.props.requestLitter(id);
    }

    public render() {
        if (this.props.litter) {
            var offset = this.props.litter.weeksToWean * 7 * 24 * 60 * 60 * 1000;
            this.props.litter.available = new Date(this.props.litter.bornOn);
            this.props.litter.available.setTime(this.props.litter.available.getTime() + offset);
            this.props.litter.animal = this.props.litter.animal.charAt(0).toUpperCase() + this.props.litter.animal.slice(1);

            return <div className="litter-grid row">
                <div className="litter-pic col-sm-4">
                    <img src={this.props.litter.pictureUrl ? this.props.litter.pictureUrl : "https://www.mikkis.co.uk/themes/responsive/images/placeholder-500.png"} />
                </div>
                <div className="litter-details col-sm-4">
                    <p>
                        <b>{this.props.litter.animal}:</b> {this.props.litter.breed}
                        <br />
                        <b>Location:</b> {this.props.litter.user.location}
                        <br />
                        <b>Contact:</b> {this.props.litter.user.name}
                        <br />
                        <b>Phone:</b> {this.props.litter.user.phone}
                        <br />
                        <b>Born:</b> {formatDateString(new Date(this.props.litter.bornOn))}
                        <br />
                        <b>Available:</b> {formatDateString(this.props.litter.available)}
                        <br />
                        <b>Price:</b> {"$" + this.props.litter.price.toFixed(2)}
                        {this.deposit()}
                    </p>
                    <p dangerouslySetInnerHTML={this.formatDescription()} />
                </div>
                <div className="animals-grid col-sm-4">{this.renderGrid()}</div>
            </div>;
        }
        else
            return <div></div>;
    }

    private deposit() {
        if (this.props.litter && this.props.litter.deposit > 0) {
            return <span><br /><b>Deposit:</b> {"$" + this.props.litter.deposit.toFixed(2) }</span>;
        }
    }

    private formatDescription() {
        if (this.props.litter && this.props.litter.description) {
            var description = this.props.litter.description;

            // sanitise the input to guard against XSS attacks
            description = description.replace(/&/g, '&amp;')
            description = description.replace(/"/g, '&quot;')
            description = description.replace(/'/g, '&#39;')
            description = description.replace(/</g, '&lt;')
            description = description.replace(/>/g, '&gt;');

            description = description.replace(new RegExp('\n', 'g'), '<br/>');
            return { __html: description };
        }
    };

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
