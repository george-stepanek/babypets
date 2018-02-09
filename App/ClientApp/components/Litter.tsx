import * as React from 'react';
import { NavLink, Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LitterState from '../store/Litter';
import * as $ from "jquery";

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
    private placeholder_image = "./img/placeholder-500.png";

    componentWillMount() {
        // This method runs when the component is first added to the page
        let id = parseInt(this.props.match.params.id) || 0;
        this.props.requestLitter(id);
    }

    componentDidMount() {
        var self = this;
        $('#photo-placeholder, .grid-item img').on('error', function () {
            $(this).attr("src", self.placeholder_image);
        });
    }

    public render() {
        let id = parseInt(this.props.match.params.id) || 0;
        if (this.props.litter) {
            var available = new Date(this.props.litter.bornOn);
            available.setTime(available.getTime() + this.props.litter.weeksToWean * 7 * 24 * 60 * 60 * 1000);

            return <div className="litter-grid row">
                <div className="litter-pic col-sm-4">
                    <div className="litter-pic-content">
                        <img id="picture" src={this.props.litter.pictureUrl ? this.props.litter.pictureUrl : this.placeholder_image} />
                    </div>
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
                        <b>Available:</b> {formatDateString(available)}
                        <br />
                        <b>Price:</b> {"$" + this.props.litter.price.toFixed(2)}
                        {this.deposit()}
                    </p>
                    <p dangerouslySetInnerHTML={this.formatDescription()} />
                    <div className="buttons">
                        <button type="button" className="btn btn-default" id="delete-btn" onClick={() => { this.props.deleteLitter(id, this) }}>Delete</button>
                         <NavLink exact to={'/editlitter/' + this.props.litter.id}>
                            <button type="button" className="btn btn-primary">Edit</button>
                        </NavLink>
                   </div>
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
                        <div><img src={animal.pictureUrl ? animal.pictureUrl : this.placeholder_image} /></div>
                        <b>{animal.isFemale ? "Female" : "Male"}</b>
                        <br />
                        {animal.priceOverride > 0 ? "$" + animal.priceOverride.toFixed(0) + " " : ""}
                        <i>{animal.sold ? "Sold" : (animal.hold ? "On Hold" : "For Sale")}</i>
                        <br />
                        {animal.description}
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
