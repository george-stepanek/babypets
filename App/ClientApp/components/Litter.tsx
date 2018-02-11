import * as React from 'react';
import { NavLink, Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LitterState from '../store/Litter';
import * as $ from "jquery";
import { AnimalData } from "ClientApp/store/Model";

export function formatDateString(date: Date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var day = ('0' + date.getDate()).slice(-2);
    var month = monthNames[date.getMonth()];
    return day + " " + month + " " + date.getFullYear();
}

type LitterProps = LitterState.LitterState & typeof LitterState.actionCreators & RouteComponentProps<{ id: string }>;
class Litter extends React.Component<LitterProps, {}> {
    private placeholder_image = "./img/placeholder-500.png";

    componentWillMount() {
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
        let animalid = this.props.animalid || 0;
        let id = parseInt(this.props.match.params.id) || 0;

        if (this.props.litter) {
            var animal = this.props.litter.animals.find(a => a.id == animalid) as AnimalData;
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
                    <p dangerouslySetInnerHTML={this.formatDescription(this.props.litter.description)} />
                    <div className="buttons">
                        <NavLink exact to={'/editlitter/' + this.props.litter.id}>
                            <button type="button" className="btn btn-primary">Edit</button>
                        </NavLink>
                   </div>
                </div>
                <div className="animals-grid col-sm-4">{this.renderGrid()}</div>
                <div className="modal fade" id="animal-modal" role="dialog" key={animalid}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="litter-pic-content">
                                    <img id='animal-placeholder' src={animalid > 0 && animal.pictureUrl ? animal.pictureUrl : this.placeholder_image}></img>
                                </div>
                                <p>
                                    <b>Gender:</b> {animalid > 0 ? (animal.isFemale ? "Female" : "Male") : ""}
                                    <br />
                                    <b>Status:</b> {animalid > 0 ? (animal.sold ? "Sold" : (animal.hold ? "On Hold" : "For Sale")) : ""}
                                    <br />
                                    <b>Price:</b> ${animalid > 0 ? (animal.priceOverride > 0 ? animal.priceOverride.toFixed(2) : this.props.litter.price.toFixed(2)) : "0.00"}
                                </p>
                                <p dangerouslySetInnerHTML={this.formatDescription(animalid > 0 ? animal.description : "")} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
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

    private formatDescription(description: string) {
        // sanitise the input to guard against XSS attacks
        description = description.replace(/&/g, '&amp;')
        description = description.replace(/"/g, '&quot;')
        description = description.replace(/'/g, '&#39;')
        description = description.replace(/</g, '&lt;')
        description = description.replace(/>/g, '&gt;');

        description = description.replace(new RegExp('\n', 'g'), '<br/>');
        return { __html: description };
    };

    private renderGrid() {
        if (this.props.litter)
            return <div>
                {this.props.litter.animals.map(animal =>
                    <div className="grid-item" key={animal.id} onClick={() => { this.props.showAnimal(animal.id, this) }}>
                        <div><img src={animal.pictureUrl ? animal.pictureUrl : this.placeholder_image} /></div>
                        <b>{animal.isFemale ? "Female" : "Male"}</b>
                        <br />
                        {animal.priceOverride > 0 ? "$" + animal.priceOverride.toFixed(0) + " " : ""}
                        <i>{animal.sold ? "Sold" : (animal.hold ? "On Hold" : "For Sale")}</i>
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
